<?php

namespace App\Http\Controllers;

use App\Models\AddressesModel;
use App\Models\OrderModel;
use App\Models\RoleModel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Format a user model into a clean customer response object.
     */
    private function formatCustomer(User $user): array
    {
        $ordersCount = $user->orders_count ?? ($user->relationLoaded('orders') ? $user->orders->count() : 0);
        $totalSpent = (float) ($user->orders_sum_total ?? ($user->relationLoaded('orders') ? $user->orders->sum('total') : 0));
        
        $primaryAddress = $user->addresses ? $user->addresses->first() : null;
        $location = 'Phnom Penh, Cambodia';
        if ($primaryAddress) {
            $locationParts = array_filter([
                $primaryAddress->address_line,
                $primaryAddress->city,
                $primaryAddress->province
            ]);
            $location = !empty($locationParts) ? implode(', ', $locationParts) : 'Phnom Penh, Cambodia';
        }

        $tier = 'Regular';
        if ($totalSpent >= 500) {
            $tier = 'VIP';
        } elseif ($user->created_at && $user->created_at->diffInDays(now()) <= 14) {
            $tier = 'New';
        }

        return [
            'id' => 'CUST-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            'db_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?: '+855 (0) 12 345 678',
            'location' => $location,
            'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&background=f59e0b&color=fff&size=150',
            'status' => ucfirst($user->status ?? 'active'),
            'tier' => $tier,
            'totalOrders' => $ordersCount,
            'totalSpent' => $totalSpent,
            'joinDate' => $user->created_at ? $user->created_at->format('M d, Y') : 'Recent',
            'lastActive' => $user->updated_at ? $user->updated_at->diffForHumans() : 'Just now',
            'role' => $user->role ? $user->role->name : 'user',
        ];
    }

    /**
     * Display a listing of customers with pagination and metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['role', 'addresses', 'orders'])
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->latest('id');

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('addresses', function ($aq) use ($search) {
                      $aq->where('city', 'like', "%{$search}%")
                         ->orWhere('province', 'like', "%{$search}%")
                         ->orWhere('address_line', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', strtolower($request->status));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'newest');
        switch ($sortBy) {
            case 'spent-desc':
                $query->orderByDesc('orders_sum_total');
                break;
            case 'spent-asc':
                $query->orderBy('orders_sum_total', 'asc');
                break;
            case 'orders-desc':
                $query->orderByDesc('orders_count');
                break;
            case 'name-asc':
                $query->orderBy('name', 'asc');
                break;
            default:
                $query->latest('id');
                break;
        }

        $perPage = (int) $request->input('per_page', 8);
        $paginator = $query->paginate($perPage);

        $formattedCustomers = collect($paginator->items())->map(function ($user) {
            return $this->formatCustomer($user);
        });

        // Apply Tier Filter in-memory if requested
        if ($request->filled('tier') && strtolower($request->tier) !== 'all') {
            $tierFilter = ucfirst(strtolower($request->tier));
            $formattedCustomers = $formattedCustomers->filter(function ($c) use ($tierFilter) {
                return $c['tier'] === $tierFilter;
            })->values();
        }

        // Calculate Overall Metrics
        $totalCustomers = User::count();
        $activeCustomers = User::where('status', 'active')->count();
        $totalRevenue = (float) OrderModel::sum('total');
        
        // Count VIPs (Users with >= 500 in total orders)
        $vipCustomers = User::whereHas('orders', function ($q) {
            $q->select('user_id')
              ->groupBy('user_id')
              ->havingRaw('SUM(total) >= 500');
        })->count();

        return response()->json([
            'success' => true,
            'message' => 'Customers retrieved successfully',
            'customers' => $formattedCustomers,
            'User' => User::all(), // Backwards compatibility
            'metrics' => [
                'total_customers' => $totalCustomers,
                'active_customers' => $activeCustomers,
                'vip_customers' => $vipCustomers,
                'total_revenue' => $totalRevenue,
            ],
            'hasMore' => $paginator->hasMorePages(),
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'total' => $paginator->total(),
            'perPage' => $paginator->perPage(),
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:4',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string',
            'tier' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $userRole = RoleModel::where('name', 'user')->first();
        $roleId = $userRole ? $userRole->id : 2;

        $rawStatus = strtolower($request->input('status', 'active'));
        $status = in_array($rawStatus, ['active', 'inactive']) ? $rawStatus : 'active';

        $user = DB::transaction(function () use ($request, $roleId, $status) {
            $createdUser = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->input('password', 'password123')),
                'phone' => $request->phone,
                'role_id' => $roleId,
                'status' => $status,
            ]);

            if ($request->filled('location')) {
                AddressesModel::create([
                    'user_id' => $createdUser->id,
                    'full_name' => $createdUser->name,
                    'phone' => $createdUser->phone ?: '012345678',
                    'address_line' => $request->location,
                    'city' => $request->location,
                    'province' => 'Phnom Penh',
                    'district' => 'District 1',
                    'is_default' => 1,
                ]);
            }

            return $createdUser;
        });

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'customer' => $this->formatCustomer($user->load(['role', 'addresses', 'orders'])),
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified customer.
     */
    public function show($id): JsonResponse
    {
        $user = User::with(['role', 'addresses', 'orders.items.product'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Customer details retrieved',
            'customer' => $this->formatCustomer($user),
            'user' => $user,
            'orders' => $user->orders,
            'addresses' => $user->addresses,
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::with(['role', 'addresses', 'orders'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:4',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        if ($request->filled('status')) {
            $rawStatus = strtolower($request->status);
            $updateData['status'] = in_array($rawStatus, ['active', 'inactive']) ? $rawStatus : 'active';
        }

        DB::transaction(function () use ($user, $updateData, $request) {
            $user->update($updateData);

            if ($request->filled('location')) {
                $address = AddressesModel::where('user_id', $user->id)->first();
                if ($address) {
                    $address->update([
                        'address_line' => $request->location,
                        'city' => $request->location,
                    ]);
                } else {
                    AddressesModel::create([
                        'user_id' => $user->id,
                        'full_name' => $user->name,
                        'phone' => $user->phone ?: '012345678',
                        'address_line' => $request->location,
                        'city' => $request->location,
                        'province' => 'Phnom Penh',
                        'district' => 'District 1',
                        'is_default' => 1,
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully',
            'customer' => $this->formatCustomer($user->fresh(['role', 'addresses', 'orders'])),
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Remove the specified customer.
     */
    public function destroy($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found',
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully',
            'deleted_id' => $id,
        ]);
    }
}

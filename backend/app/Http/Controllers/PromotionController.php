<?php

namespace App\Http\Controllers;

use App\Models\PromotionModel;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    /**
     * Format a PromotionModel into a standard API response structure.
     */
    private function formatPromo(PromotionModel $promo): array
    {
        $discountText = $promo->discount_text;
        if (!$discountText) {
            if ($promo->discount_type === 'shipping') {
                $discountText = 'Free Delivery';
            } elseif ($promo->discount_type === 'percentage') {
                $discountText = ((float) $promo->discount_value) . '% OFF';
            } else {
                $discountText = '$' . number_format((float) $promo->discount_value, 2) . ' OFF';
            }
        }

        return [
            'id' => 'PRM-' . str_pad($promo->id, 3, '0', STR_PAD_LEFT),
            'db_id' => $promo->id,
            'code' => strtoupper($promo->code),
            'title' => $promo->title,
            'description' => $promo->description,
            'discount' => $discountText,
            'discount_type' => $promo->discount_type ?? 'percentage',
            'discount_value' => (float) $promo->discount_value,
            'min_order_amount' => (float) $promo->min_order_amount,
            'validTill' => $promo->valid_till ? Carbon::parse($promo->valid_till)->format('Y-m-d') : '2026-12-31',
            'usageCount' => (int) $promo->usage_count,
            'usageLimit' => $promo->usage_limit ? (int) $promo->usage_limit : null,
            'status' => $promo->status ?? 'Active',
            'type' => $promo->type ?? 'Coupon',
            'created_at' => $promo->created_at ? $promo->created_at->format('M d, Y') : null,
        ];
    }

    /**
     * Display a listing of the resource with 8-item batch pagination and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PromotionModel::latest('id');

        // Search Filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        // Type Filter
        if ($request->filled('type') && strtolower($request->type) !== 'all') {
            $query->where('type', $request->type);
        }

        // Global KPI Metrics across all promotions in DB
        $allPromos = PromotionModel::all();
        $totalPromos = $allPromos->count();
        $activePromos = $allPromos->where('status', 'Active')->count();
        $expiredPromos = $allPromos->whereIn('status', ['Expired', 'Disabled'])->count();
        $totalRedeemed = (int) $allPromos->sum('usage_count');

        // 8-item batch pagination
        $perPage = (int) $request->input('per_page', 8);
        $paginator = $query->paginate($perPage);

        $promotions = collect($paginator->items())->map(function ($item) {
            return $this->formatPromo($item);
        });

        return response()->json([
            'success' => true,
            'message' => 'Promotions retrieved successfully',
            'promotions' => $promotions,
            'metrics' => [
                'total_promos' => $totalPromos,
                'active_promos' => $activePromos,
                'expired_promos' => $expiredPromos,
                'total_redeemed' => $totalRedeemed,
            ],
            'hasMore' => $paginator->hasMorePages(),
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'total' => $paginator->total(),
            'perPage' => $paginator->perPage(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:promotions,code',
            'title' => 'required|string|max:255',
            'discount' => 'nullable|string|max:50',
            'discount_type' => 'nullable|string|in:percentage,fixed,shipping',
            'discount_value' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'validTill' => 'nullable|date',
            'type' => 'nullable|string|max:50',
            'status' => 'nullable|string|in:Active,Expired,Disabled',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error while creating promotion',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Parse discount string if provided
        $discountText = $request->input('discount');
        $discountType = $request->input('discount_type', 'percentage');
        $discountVal = (float) $request->input('discount_value', 0);

        if ($discountText && !$request->has('discount_value')) {
            if (stripos($discountText, 'free') !== false) {
                $discountType = 'shipping';
                $discountVal = 0;
            } elseif (preg_match('/(\d+(?:\.\d+)?)\s*%/i', $discountText, $matches)) {
                $discountType = 'percentage';
                $discountVal = (float) $matches[1];
            } elseif (preg_match('/\$?\s*(\d+(?:\.\d+)?)/i', $discountText, $matches)) {
                $discountType = 'fixed';
                $discountVal = (float) $matches[1];
            }
        }

        if (!$discountText) {
            $discountText = $discountType === 'percentage' ? "{$discountVal}% OFF" : ($discountType === 'shipping' ? 'Free Delivery' : "\${$discountVal} OFF");
        }

        $promo = PromotionModel::create([
            'code' => strtoupper(trim($request->input('code'))),
            'title' => trim($request->input('title')),
            'description' => $request->input('description'),
            'discount_type' => $discountType,
            'discount_value' => $discountVal,
            'discount_text' => $discountText,
            'min_order_amount' => (float) $request->input('min_order_amount', 0),
            'usage_limit' => $request->input('usage_limit'),
            'usage_count' => 0,
            'type' => $request->input('type', 'Coupon'),
            'status' => $request->input('status', 'Active'),
            'valid_from' => now()->toDateString(),
            'valid_till' => $request->input('validTill') ?: $request->input('valid_till', '2026-12-31'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Promotion code created successfully',
            'promo' => $this->formatPromo($promo),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $promo = PromotionModel::find($id);
        if (!$promo) {
            $promo = PromotionModel::where('code', strtoupper($id))->first();
        }

        if (!$promo) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'promo' => $this->formatPromo($promo),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $promo = PromotionModel::find($id);
        if (!$promo) {
            $promo = PromotionModel::where('code', strtoupper($id))->first();
        }

        if (!$promo) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:50|unique:promotions,code,' . $promo->id,
            'title' => 'sometimes|required|string|max:255',
            'discount' => 'nullable|string|max:50',
            'discount_type' => 'nullable|string|in:percentage,fixed,shipping',
            'discount_value' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'validTill' => 'nullable|date',
            'type' => 'nullable|string|max:50',
            'status' => 'nullable|string|in:Active,Expired,Disabled',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error while updating promotion',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = [];
        if ($request->has('code')) $data['code'] = strtoupper(trim($request->code));
        if ($request->has('title')) $data['title'] = trim($request->title);
        if ($request->has('description')) $data['description'] = $request->description;
        if ($request->has('discount_type')) $data['discount_type'] = $request->discount_type;
        if ($request->has('discount_value')) $data['discount_value'] = (float) $request->discount_value;
        if ($request->has('discount')) $data['discount_text'] = $request->discount;
        if ($request->has('min_order_amount')) $data['min_order_amount'] = (float) $request->min_order_amount;
        if ($request->has('usage_limit')) $data['usage_limit'] = $request->usage_limit;
        if ($request->has('type')) $data['type'] = $request->type;
        if ($request->has('status')) $data['status'] = $request->status;
        if ($request->has('validTill')) $data['valid_till'] = $request->validTill;
        if ($request->has('valid_till')) $data['valid_till'] = $request->valid_till;

        $promo->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Promotion updated successfully',
            'promo' => $this->formatPromo($promo->fresh()),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $promo = PromotionModel::find($id);
        if (!$promo) {
            $promo = PromotionModel::where('code', strtoupper($id))->first();
        }

        if (!$promo) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion not found',
            ], 404);
        }

        $promo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promotion deleted successfully',
        ]);
    }

    /**
     * Toggle promotion active/disabled status.
     */
    public function toggleStatus(Request $request, string $id): JsonResponse
    {
        $promo = PromotionModel::find($id);
        if (!$promo) {
            $promo = PromotionModel::where('code', strtoupper($id))->first();
        }

        if (!$promo) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion not found',
            ], 404);
        }

        $nextStatus = $promo->status === 'Active' ? 'Disabled' : 'Active';
        if ($request->has('status')) {
            $nextStatus = $request->status;
        }

        $promo->update(['status' => $nextStatus]);

        return response()->json([
            'success' => true,
            'message' => "Promotion status changed to {$nextStatus}",
            'promo' => $this->formatPromo($promo->fresh()),
        ]);
    }
}

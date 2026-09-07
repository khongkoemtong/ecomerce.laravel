<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderStoreRequest;
use App\Http\Requests\OrderUpdateRequest;
use App\Http\Resources\OrderResource;
use App\Models\AddressesModel;
use App\Models\CartModel;
use App\Models\OrderItemModel;
use App\Models\OrderModel;
use App\Models\ProductModel;
use App\Services\OrderInventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderInventoryService $inventoryService
    ) {
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);
        } while (OrderModel::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function getProductPrice(ProductModel $product): float
    {
        if ($product->discount_price && $product->discount_price < $product->price) {
            return (float) $product->discount_price;
        }

        return (float) $product->price;
    }

    private function targetUserId(Request $request): int
    {
        if ($request->user()->role?->name === 'admin' && $request->filled('user_id')) {
            return (int) $request->user_id;
        }

        return (int) $request->user()->id;
    }

    private function shippingFeeFor(AddressesModel $address): float
    {
        return 0.0;
    }

    private function validateOrderStatusTransition(OrderModel $order, ?string $nextStatus): ?string
    {
        if ($nextStatus === null || $nextStatus === $order->order_status) {
            return null;
        }

        $allowedTransitions = [
            OrderModel::ORDER_STATUS_PENDING => [
                OrderModel::ORDER_STATUS_PAID,
                OrderModel::ORDER_STATUS_PROCESSING,
                OrderModel::ORDER_STATUS_CANCELLED,
            ],
            OrderModel::ORDER_STATUS_PAID => [
                OrderModel::ORDER_STATUS_PROCESSING,
                OrderModel::ORDER_STATUS_CANCELLED,
            ],
            OrderModel::ORDER_STATUS_PROCESSING => [
                OrderModel::ORDER_STATUS_SHIPPED,
                OrderModel::ORDER_STATUS_CANCELLED,
            ],
            OrderModel::ORDER_STATUS_SHIPPED => [
                OrderModel::ORDER_STATUS_DELIVERED,
            ],
            OrderModel::ORDER_STATUS_DELIVERED => [],
            OrderModel::ORDER_STATUS_CANCELLED => [],
        ];

        return in_array($nextStatus, $allowedTransitions[$order->order_status] ?? [], true)
            ? null
            : 'Invalid order status transition.';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', OrderModel::class);

        $query = OrderModel::with(['items.product', 'address', 'user'])->latest();

        if ($request->user()->role?->name !== 'admin') {
            $query->where('user_id', $request->user()->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        return $this->successResponse('Orders found.', [
            'orders' => OrderResource::collection($query->paginate($request->integer('per_page', 20))),
        ]);
    }

    public function myOrders(Request $request): JsonResponse
    {
        $userId = null;
        if ($request->user()) {
            $userId = $request->user()->id;
        } elseif ($request->filled('user_id')) {
            $userId = (int) $request->user_id;
        } elseif ($request->filled('email')) {
            $user = \App\Models\User::where('email', $request->email)->first();
            $userId = $user?->id;
        }

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User not identified.',
                'orders' => []
            ], 401);
        }

        $orders = OrderModel::with(['items.product', 'address', 'user'])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Orders fetched successfully.',
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function store(OrderStoreRequest $request)
    {
        $this->authorize('create', OrderModel::class);

        $userId = $this->targetUserId($request);
        $address = AddressesModel::where('id', $request->address_id)
            ->where('user_id', $userId)
            ->first();

        if (!$address) {
            return $this->errorResponse('The selected address does not belong to this user.', 422);
        }

        $carts = CartModel::where('user_id', $userId)->get();

        if ($carts->isEmpty()) {
            return $this->errorResponse('Cart is empty.', 422);
        }

        try {
            $order = DB::transaction(function () use ($request, $carts, $userId, $address) {
                $subtotal = 0.0;
                $discount = 0.0;
                $shippingFee = $this->shippingFeeFor($address);
                $orderItems = [];

                foreach ($carts as $cart) {
                    $product = ProductModel::lockForUpdate()->find($cart->product_id);

                    if (!$product) {
                        throw new \RuntimeException('Product not found.');
                    }

                    if ($cart->quantity > $product->stock_qty) {
                        throw new \RuntimeException('Not enough stock for ' . $product->name . '.');
                    }

                    $originalPrice = (float) $product->price;
                    $finalPrice = $this->getProductPrice($product);
                    $discountAmount = max($originalPrice - $finalPrice, 0);

                    $subtotal += $originalPrice * $cart->quantity;
                    $discount += $discountAmount * $cart->quantity;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'price' => $finalPrice,
                        'quantity' => $cart->quantity,
                        'total' => $finalPrice * $cart->quantity,
                    ];
                }

                $total = $subtotal - $discount + $shippingFee;

                $order = OrderModel::create([
                    'user_id' => $userId,
                    'address_id' => $address->id,
                    'order_number' => $this->generateOrderNumber(),
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'shipping_fee' => $shippingFee,
                    'total' => $total,
                    'payment_status' => OrderModel::PAYMENT_STATUS_PENDING,
                    'order_status' => OrderModel::ORDER_STATUS_PENDING,
                    'payment_method' => $request->payment_method ?? 'cash_on_delivery',
                ]);

                foreach ($orderItems as $item) {
                    OrderItemModel::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'total' => $item['total'],
                    ]);
                }

                if ($order->payment_method === 'cash_on_delivery') {
                    $this->inventoryService->reduceStockForOrder($order);
                }

                CartModel::where('user_id', $userId)->delete();

                return $order;
            });
        } catch (Throwable $e) {
            Log::error('Order checkout failed.', [
                'user_id' => $userId,
                'address_id' => $request->address_id,
                'message' => $e->getMessage(),
            ]);

            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse('Order created successfully.', [
            'order' => new OrderResource($order->load('items')),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $order = OrderModel::with('items')->find($id);

        if (!$order) {
            return $this->errorResponse('Order not found.', 404);
        }

        $this->authorize('view', $order);

        return $this->successResponse('Order found.', [
            'order' => new OrderResource($order),
        ]);
    }

    public function update(OrderUpdateRequest $request, $id)
    {
        $order = OrderModel::with('items')->find($id);

        if (!$order) {
            return $this->errorResponse('Order not found.', 404);
        }

        $this->authorize('update', $order);

        $validated = $request->validated();
        $transitionError = $this->validateOrderStatusTransition($order, $validated['order_status'] ?? null);

        if ($transitionError) {
            return $this->errorResponse($transitionError, 422);
        }

        try {
            DB::transaction(function () use ($order, $validated) {
                if (($validated['order_status'] ?? null) === OrderModel::ORDER_STATUS_CANCELLED) {
                    $this->inventoryService->restoreStockForOrder($order);
                    $validated['payment_status'] = $validated['payment_status'] ?? OrderModel::PAYMENT_STATUS_FAILED;
                }

                if (($validated['payment_status'] ?? null) === OrderModel::PAYMENT_STATUS_PAID) {
                    $this->inventoryService->reduceStockForOrder($order);
                    $validated['order_status'] = $validated['order_status'] ?? OrderModel::ORDER_STATUS_PAID;
                }

                if (in_array($validated['payment_status'] ?? null, [
                    OrderModel::PAYMENT_STATUS_FAILED,
                    OrderModel::PAYMENT_STATUS_REFUNDED,
                ], true)) {
                    $this->inventoryService->restoreStockForOrder($order);
                    $validated['order_status'] = $validated['order_status'] ?? OrderModel::ORDER_STATUS_CANCELLED;
                }

                $order->update($validated);
            });
        } catch (Throwable $e) {
            Log::error('Order update failed.', [
                'order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);

            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse('Order updated successfully.', [
            'order' => new OrderResource($order->fresh('items')),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $order = OrderModel::with('items')->find($id);

        if (!$order) {
            return $this->errorResponse('Order not found.', 404);
        }

        $this->authorize('delete', $order);

        DB::transaction(function () use ($order) {
            $this->inventoryService->restoreStockForOrder($order);
            $order->delete();
        });

        return $this->successResponse('Order deleted successfully.', [
            'order' => $order,
        ]);
    }

    public function getOrderLineData(Request $request): JsonResponse
    {
        $query = OrderModel::with(['user', 'items.product'])->orderBy('id', 'desc');

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('order_status', strtolower($request->status));
        }

        if ($request->filled('date') && strtolower($request->date) !== 'all time') {
            $dateRange = strtolower($request->date);
            if ($dateRange === 'today') {
                $query->whereDate('created_at', now()->today());
            } elseif ($dateRange === 'this week') {
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            } elseif ($dateRange === 'this month') {
                $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
            } elseif ($dateRange === 'this year') {
                $query->whereYear('created_at', now()->year);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('items', function($iq) use ($search) {
                      $iq->where('product_name', 'like', "%{$search}%");
                  });
            });
        }

        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $orders = $paginator->items();
        $formattedOrders = [];

        if (count($orders) > 0) {
            foreach ($orders as $index => $ord) {
                $subItems = [];
                foreach ($ord->items as $itemIndex => $item) {
                    $subItems[] = [
                        'id' => 'sub-' . $item->id,
                        'name' => $item->product_name ?: ($item->product ? $item->product->name : 'Product Item'),
                        'sku' => $item->product && $item->product->sku ? $item->product->sku : ('SKU-' . str_pad($item->product_id, 4, '0', STR_PAD_LEFT)),
                        'image' => $item->product && $item->product->image ? $item->product->image : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80',
                        'pick' => (int)$item->quantity,
                        'bin' => 'C01' . ($itemIndex + 1) . '-0' . ($itemIndex + 10),
                        'vendor' => 'VENDOR-' . strtoupper(substr($item->product_name ?: 'MAIN', 0, 5)),
                        'onHand' => $item->product ? (int)$item->product->stock_qty : 50,
                    ];
                }

                $statusLabel = ucfirst($ord->order_status);
                $statusType = strtolower($ord->order_status);

                $formattedOrders[] = [
                    'id' => '#' . ($ord->order_number ?: ('67' . str_pad($ord->id, 2, '0', STR_PAD_LEFT))),
                    'db_id' => $ord->id,
                    'date' => $ord->created_at ? $ord->created_at->format('m/d/Y') : '08/11/2026',
                    'customer' => $ord->user ? $ord->user->name : 'Customer #' . $ord->user_id,
                    'salesChannel' => $index % 2 === 0 ? 'Amazon' : 'Etsy',
                    'salesChannelIcon' => $index % 2 === 0 ? 'amazon' : 'etsy',
                    'destination' => $index % 2 === 0 ? 'International' : 'Domestic',
                    'itemsCount' => $ord->items->count(),
                    'status' => $statusLabel,
                    'statusType' => $statusType,
                    'isExpanded' => $index === 0,
                    'subItems' => $subItems,
                ];
            }
        }

        return response()->json([
            'orders' => $formattedOrders,
            'hasMore' => $paginator->hasMorePages(),
            'currentPage' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'lastPage' => $paginator->lastPage(),
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function updateOrderStatus(Request $request, $id): JsonResponse
    {
        // Try finding order by primary key ID first
        $order = OrderModel::find($id);

        if (!$order) {
            // Clean ID string to search by order_number or numeric id
            $cleanId = trim((string)$id, '#');
            $numericId = (int)preg_replace('/[^0-9]/', '', $cleanId);

            $order = OrderModel::where('order_number', $cleanId)
                ->orWhere('order_number', 'ORD-' . $cleanId)
                ->orWhere('id', $numericId)
                ->first();
        }

        if (!$order) {
            return response()->json(['message' => 'Order not found for ID: ' . $id], 404);
        }

        $rawStatus = strtolower($request->input('status', 'pending'));

        // Map frontend display statuses to valid DB enum values
        $statusMap = [
            'pending' => OrderModel::ORDER_STATUS_PENDING,
            'processing' => OrderModel::ORDER_STATUS_PROCESSING,
            'shipped' => OrderModel::ORDER_STATUS_SHIPPED,
            'delivered' => OrderModel::ORDER_STATUS_DELIVERED,
            'fulfilled' => OrderModel::ORDER_STATUS_DELIVERED,
            'unfulfilled' => OrderModel::ORDER_STATUS_PENDING,
            'cancelled' => OrderModel::ORDER_STATUS_CANCELLED,
            'paid' => OrderModel::ORDER_STATUS_PAID,
        ];

        $status = $statusMap[$rawStatus] ?? OrderModel::ORDER_STATUS_PENDING;

        $order->order_status = $status;
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
            'status' => ucfirst($status),
        ]);
    }

    public function createAdminOrder(Request $request): JsonResponse
    {
        $customerName = $request->input('customer', 'Guest Customer');
        $user = \App\Models\User::where('name', $customerName)->first();
        if (!$user) {
            $user = \App\Models\User::first();
        }
        if (!$user) {
            $user = \App\Models\User::create([
                'name' => $customerName,
                'email' => strtolower(str_replace(' ', '', $customerName)) . rand(100, 999) . '@example.com',
                'password' => bcrypt('password'),
            ]);
        }
        $userId = $user->id;

        $address = AddressesModel::where('user_id', $userId)->first();
        if (!$address) {
            $address = AddressesModel::create([
                'user_id' => $userId,
                'address' => '123 Main Street',
                'city' => 'Phnom Penh',
                'state' => 'Phnom Penh',
                'postal_code' => '12000',
                'country' => 'Cambodia',
                'phone' => '012345678',
            ]);
        }

        $orderNumber = 'ORD-' . strtoupper(substr(md5((string)microtime()), 0, 8));
        $total = (float)($request->input('total', 150.00));

        $order = OrderModel::create([
            'user_id' => $userId,
            'address_id' => $address->id,
            'order_number' => $orderNumber,
            'total' => $total,
            'subtotal' => $total,
            'shipping_fee' => 0,
            'discount' => 0,
            'order_status' => strtolower($request->input('status', OrderModel::ORDER_STATUS_PENDING)),
            'payment_status' => OrderModel::PAYMENT_STATUS_PENDING,
            'payment_method' => $request->input('payment_method', 'cash_on_delivery'),
        ]);

        $productName = $request->input('itemName', 'Custom Order Item');
        $sku = $request->input('sku');
        $product = null;
        if ($sku) {
            $product = ProductModel::where('sku', $sku)->first();
        }
        if (!$product) {
            $product = ProductModel::where('name', 'like', "%{$productName}%")->first() ?? ProductModel::first();
        }

        $quantity = (int)($request->input('quantity', 1)) ?: 1;
        $price = (float)($request->input('price', $total / $quantity));

        OrderItemModel::create([
            'order_id' => $order->id,
            'product_id' => $product ? $product->id : 1,
            'product_name' => $productName,
            'quantity' => $quantity,
            'price' => $price,
            'total' => $price * $quantity,
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load(['user', 'items.product']),
        ], 201);
    }

    public function checkoutStore(Request $request): JsonResponse
    {
        $items = $request->input('items', []);
        if (empty($items)) {
            return response()->json([
                'success' => false,
                'message' => 'Your shopping bag is empty.',
            ], 422);
        }

        // 1. Enforce Account Requirement (User must have an account)
        $user = null;
        if ($request->user()) {
            $user = $request->user();
        } elseif ($request->filled('user_id')) {
            $user = \App\Models\User::find($request->user_id);
        } elseif ($request->filled('email')) {
            $user = \App\Models\User::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'require_auth' => true,
                'message' => 'Please sign in or create an account to complete your payment and order.',
            ], 401);
        }

        // 2. Resolve or Create Address
        // 2. Resolve Products and Validate Stock
        $resolvedProducts = [];
        foreach ($items as $item) {
            $product = null;
            if (!empty($item['dbId']) || !empty($item['product_id']) || !empty($item['id'])) {
                $prodId = $item['dbId'] ?? $item['product_id'] ?? $item['id'];
                if (is_numeric($prodId)) {
                    $product = ProductModel::find($prodId);
                } else {
                    $product = ProductModel::where('slug', $prodId)->first();
                }
            }
            if (!$product && !empty($item['sku'])) {
                $product = ProductModel::where('sku', $item['sku'])->first();
            }
            if (!$product && !empty($item['name'])) {
                $product = ProductModel::where('name', $item['name'])->first();
            }

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product "' . ($item['name'] ?? 'Item') . '" could not be found.',
                ], 404);
            }

            $qty = max(1, (int) ($item['quantity'] ?? 1));

            // Strict Stock Verification: Cannot buy if out of stock or quantity exceeds stock
            if ((int)$product->stock_qty <= 0) {
                return response()->json([
                    'success' => false,
                    'out_of_stock' => true,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'message' => 'Sorry, "' . $product->name . '" is currently out of stock and cannot be purchased.',
                ], 422);
            }

            if ($qty > (int)$product->stock_qty) {
                return response()->json([
                    'success' => false,
                    'insufficient_stock' => true,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'available_stock' => (int)$product->stock_qty,
                    'message' => 'Sorry, only ' . $product->stock_qty . ' unit(s) left in stock for "' . $product->name . '" (Requested: ' . $qty . ').',
                ], 422);
            }

            $resolvedProducts[] = [
                'product' => $product,
                'item' => $item,
                'qty' => $qty,
            ];
        }

        // 3. Resolve or Create Address
        $fullName = trim((string)$request->input('customer_name')) ?: ($user->name ?: 'Customer');
        $addressLine = trim((string)$request->input('address1')) ?: (trim((string)$request->input('address')) ?: 'Phnom Penh City, Cambodia');
        if ($request->filled('address2') && trim((string)$request->input('address2')) !== '') {
            $addressLine .= ', ' . trim((string)$request->input('address2'));
        }
        $city = trim((string)$request->input('city')) ?: 'Phnom Penh';
        $state = trim((string)$request->input('state')) ?: 'Phnom Penh';
        $phone = trim((string)$request->input('phone')) ?: ($user->phone ?: '012345678');

        $address = AddressesModel::create([
            'user_id' => $user->id,
            'full_name' => $fullName,
            'phone' => $phone ?: '012345678',
            'province' => $state,
            'city' => $city,
            'district' => $state,
            'address_line' => $addressLine,
            'is_default' => 1,
        ]);

        // 3. Create Order
        $orderNumber = $this->generateOrderNumber();
        $subtotal = (float) $request->input('subtotal', 0);
        $discount = (float) $request->input('discount', 0);
        $shippingFee = (float) $request->input('shipping_fee', 0);
        $total = (float) $request->input('total', max(0, $subtotal - $discount + $shippingFee));
        // 4. Create Order & Deduct Stock Atomically
        try {
            $order = DB::transaction(function () use ($request, $user, $address, $resolvedProducts) {
                $orderNumber = $this->generateOrderNumber();
                $subtotal = (float) $request->input('subtotal', 0);
                $discount = (float) $request->input('discount', 0);
                $shippingFee = (float) $request->input('shipping_fee', 0);
                $total = (float) $request->input('total', max(0, $subtotal - $discount + $shippingFee));

        $order = OrderModel::create([
            'user_id' => $user->id,
            'address_id' => $address->id,
            'order_number' => $orderNumber,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping_fee' => $shippingFee,
            'total' => $total,
            'payment_status' => OrderModel::PAYMENT_STATUS_PENDING,
            'order_status' => OrderModel::ORDER_STATUS_PENDING,
            'payment_method' => $request->input('payment_method', 'cash_on_delivery'),
        ]);
                $order = OrderModel::create([
                    'user_id' => $user->id,
                    'address_id' => $address->id,
                    'order_number' => $orderNumber,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'shipping_fee' => $shippingFee,
                    'total' => $total,
                    'payment_status' => OrderModel::PAYMENT_STATUS_PENDING,
                    'order_status' => OrderModel::ORDER_STATUS_PENDING,
                    'payment_method' => $request->input('payment_method', 'cash_on_delivery'),
                ]);

        // 4. Create Order Items & Reduce Stock
        foreach ($items as $item) {
            $product = null;
            if (!empty($item['dbId']) || !empty($item['product_id']) || !empty($item['id'])) {
                $prodId = $item['dbId'] ?? $item['product_id'] ?? $item['id'];
                if (is_numeric($prodId)) {
                    $product = ProductModel::find($prodId);
                } else {
                    $product = ProductModel::where('slug', $prodId)->first();
                }
            }
            if (!$product && !empty($item['sku'])) {
                $product = ProductModel::where('sku', $item['sku'])->first();
            }
            if (!$product && !empty($item['name'])) {
                $product = ProductModel::where('name', $item['name'])->first();
            }
                foreach ($resolvedProducts as $entry) {
                    $item = $entry['item'];
                    $qty = $entry['qty'];
                    
                    // Lock product row for atomic stock check
                    $product = ProductModel::lockForUpdate()->find($entry['product']->id);
                    if (!$product || $product->stock_qty < $qty) {
                        throw new \RuntimeException('Insufficient stock for product "' . ($product ? $product->name : 'Item') . '".');
                    }

            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $price = (float) ($item['price'] ?? ($product ? ($product->discount_price ?? $product->price) : 0));
            $itemTotal = $price * $qty;
            $productName = $item['name'] ?? ($product ? $product->name : 'Product Item');
                    $price = (float) ($item['price'] ?? ($product->discount_price ?? $product->price));
                    $itemTotal = $price * $qty;
                    $productName = $item['name'] ?? $product->name;

            // Format size / color variant suffix if present
            $variantInfo = [];
            if (!empty($item['size'])) $variantInfo[] = 'Size: ' . $item['size'];
            if (!empty($item['color'])) $variantInfo[] = 'Color: ' . $item['color'];
            if (!empty($variantInfo)) {
                $productName .= ' (' . implode(', ', $variantInfo) . ')';
            }
                    // Format size / color variant suffix if present
                    $variantInfo = [];
                    if (!empty($item['size'])) $variantInfo[] = 'Size: ' . $item['size'];
                    if (!empty($item['color'])) $variantInfo[] = 'Color: ' . $item['color'];
                    if (!empty($variantInfo)) {
                        $productName .= ' (' . implode(', ', $variantInfo) . ')';
                    }

            OrderItemModel::create([
                'order_id' => $order->id,
                'product_id' => $product ? $product->id : 1,
                'product_name' => $productName,
                'price' => $price,
                'quantity' => $qty,
                'total' => $itemTotal,
            ]);
                    OrderItemModel::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $productName,
                        'price' => $price,
                        'quantity' => $qty,
                        'total' => $itemTotal,
                    ]);

            if ($product) {
                $product->decrement('stock_qty', min($qty, $product->stock_qty));
            }
        }
                    // Deduct stock safely
                    $product->decrement('stock_qty', $qty);
                }

        // Increment promotion usage count if promo code was used
        if ($request->filled('promo_code')) {
            \App\Models\PromotionModel::where('code', strtoupper($request->promo_code))->increment('usage_count');
                // Increment promotion usage count if promo code was used
                if ($request->filled('promo_code')) {
                    \App\Models\PromotionModel::where('code', strtoupper($request->promo_code))->increment('usage_count');
                }

                return $order;
            });
        } catch (\Throwable $e) {
            Log::error('Checkout store failed due to stock/db error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully! Order #' . $order->order_number,
            'order' => $order->load(['user', 'items.product']),
        ], 201);
    }
}

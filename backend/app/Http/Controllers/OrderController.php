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

        $query = OrderModel::with('items')->latest();

        if ($request->user()->role?->name !== 'admin') {
            $query->where('user_id', $request->user()->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        return $this->successResponse('Orders found.', [
            'orders' => OrderResource::collection($query->paginate($request->integer('per_page', 12))),
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
        $query = OrderModel::with(['user', 'items.product'])->orderBy('id', 'asc');

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
        $user = \App\Models\UserModel::first();
        $userId = $user ? $user->id : 1;

        $orderNumber = 'ORD-' . strtoupper(substr(md5((string)microtime()), 0, 8));

        $order = OrderModel::create([
            'user_id' => $userId,
            'order_number' => $orderNumber,
            'total' => (float)($request->input('total', 150)),
            'subtotal' => (float)($request->input('total', 150)),
            'tax' => 0,
            'shipping_fee' => 0,
            'discount' => 0,
            'order_status' => OrderModel::ORDER_STATUS_PENDING,
            'payment_status' => OrderModel::PAYMENT_STATUS_UNPAID,
        ]);

        $productName = $request->input('itemName', 'Custom Order Item');
        $product = ProductModel::first();
        
        OrderItemModel::create([
            'order_id' => $order->id,
            'product_id' => $product ? $product->id : 1,
            'product_name' => $productName,
            'quantity' => 1,
            'unit_price' => 150.00,
            'subtotal' => 150.00,
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order,
        ], 201);
    }
}

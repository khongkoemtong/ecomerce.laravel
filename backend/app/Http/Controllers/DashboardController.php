<?php

namespace App\Http\Controllers;

use App\Models\CategoryModel;
use App\Models\OrderModel;
use App\Models\ProductModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get aggregated admin dashboard metrics and widget data.
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'metrics' => $this->calculateMetrics(),
            'stockChartData' => $this->calculateStockChart($request->query('period', 'Monthly')),
            'customTagProducts' => $this->calculateTagProducts($request->query('tag', 'Fast Moving')),
            'salesOrders' => $this->calculateSalesOrders($request->query('period', 'Monthly')),
            'lowStockCount' => ProductModel::where('stock_qty', '<=', 10)->count(),
        ]);
    }

    /**
     * Section 1: Top KPI Cards Data
     */
    public function getMetrics(): JsonResponse
    {
        return response()->json([
            'metrics' => $this->calculateMetrics(),
        ]);
    }

    /**
     * Section 2: Stock Volume vs Consume Rate Chart Data
     */
    public function getStockChart(Request $request): JsonResponse
    {
        $period = $request->query('period', 'Monthly');
        return response()->json([
            'period' => $period,
            'stockChartData' => $this->calculateStockChart($period),
        ]);
    }

    /**
     * Section 3: Custom Tag Products Table Data
     */
    public function getTagProducts(Request $request): JsonResponse
    {
        $tag = $request->query('tag', 'Fast Moving');
        return response()->json([
            'tag' => $tag,
            'products' => $this->calculateTagProducts($tag),
        ]);
    }

    /**
     * Section 4: Sales & Orders Table Widget Data
     */
    public function getSalesOrders(Request $request): JsonResponse
    {
        $period = $request->query('period', 'Monthly');
        return response()->json([
            'period' => $period,
            'salesOrders' => $this->calculateSalesOrders($period),
        ]);
    }

    /**
     * Section 5: AI Restock Recommendation & Delayed Shipments
     */
    public function getRestockRecommendations(): JsonResponse
    {
        $lowStockProducts = ProductModel::where('stock_qty', '<=', 10)->get(['id', 'name', 'stock_qty', 'sku', 'image']);
        $delayedOrders = OrderModel::where('order_status', OrderModel::ORDER_STATUS_SHIPPED)
            ->latest()
            ->take(5)
            ->get();

        $delayedProducts = [];
        foreach ($delayedOrders as $ord) {
            $delayedProducts[] = [
                'id' => 'ORD-' . $ord->id,
                'name' => 'Order #' . $ord->order_number,
                'delay' => '3 Days',
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80',
            ];
        }

        return response()->json([
            'itemsCount' => $lowStockProducts->count(),
            'lowStockProducts' => $lowStockProducts,
            'delayedProducts' => $delayedProducts,
        ]);
    }

    // Helper methods for calculations
    private function calculateMetrics(): array
    {
        $totalOrdersCount = OrderModel::count();
        $deliveredOrdersCount = OrderModel::where('order_status', OrderModel::ORDER_STATUS_DELIVERED)->count();
        $cancelledOrReturnedCount = OrderModel::where('order_status', OrderModel::ORDER_STATUS_CANCELLED)->count();

        $returnPercentage = $totalOrdersCount > 0
            ? (int)round(($cancelledOrReturnedCount / $totalOrdersCount) * 100)
            : 0;

        return [
            'totalOrders' => [
                'value' => number_format($totalOrdersCount),
                'change' => '+ 0%',
                'isPositive' => true,
                'period' => 'Since Last Month',
            ],
            'alreadyDelivered' => [
                'value' => number_format($deliveredOrdersCount),
                'change' => '+ 0%',
                'isPositive' => true,
                'period' => 'Since Last Month',
            ],
            'productReturn' => [
                'value' => $returnPercentage . '%',
                'countText' => (string)$cancelledOrReturnedCount,
                'subText' => 'Products Return',
                'change' => '0%',
                'isPositive' => false,
                'period' => 'Since last month',
                'percentage' => $returnPercentage,
            ],
            'turnoverRate' => [
                'value' => 'N/A',
                'subText' => 'Catalog Turnover',
                'change' => '0%',
                'isPositive' => true,
                'period' => 'Since last month',
                'percentage' => 50,
            ],
        ];
    }

    private function calculateStockChart(string $period): array
    {
        $categories = CategoryModel::take(6)->get();
        $stockChartData = [];
        $count = $categories->count();

        if ($count > 0) {
            foreach ($categories as $index => $cat) {
                $categoryStockSum = ProductModel::where('category_id', $cat->id)->sum('stock_qty');
                $categoryAvgPrice = ProductModel::where('category_id', $cat->id)->avg('price') ?: 50;

                // Calculate CX position dynamically across 500px canvas (from 50px to 450px)
                $cx = ($count > 1) ? (int)round(50 + ($index * (400 / ($count - 1)))) : 250;

                // Helper curve calculations for SVG paths:
                // Stock Line: M 0,140 Q 80,40 160,110 T 320,70 T 500,20
                // Consume Line: M 0,170 Q 90,80 170,140 T 330,100 T 500,50
                $stockY = $this->calculateStockCurveY($cx);
                $consumeY = $this->calculateConsumeCurveY($cx);

                $stockChartData[] = [
                    'id' => $index,
                    'category' => $cat->name,
                    'price' => '$ ' . number_format($categoryAvgPrice * max(1, $categoryStockSum)),
                    'cx' => $cx,
                    'stockY' => (int)round($stockY),
                    'consumeY' => (int)round($consumeY),
                ];
            }
        }

        return $stockChartData;
    }

    private function calculateStockCurveY(float $cx): float
    {
        if ($cx <= 160) {
            $t = $cx / 160;
            return (1 - $t) ** 2 * 140 + 2 * (1 - $t) * $t * 40 + $t ** 2 * 110;
        } elseif ($cx <= 320) {
            $t = ($cx - 160) / 160;
            return (1 - $t) ** 2 * 110 + 2 * (1 - $t) * $t * 180 + $t ** 2 * 70;
        } else {
            $t = ($cx - 320) / 180;
            return (1 - $t) ** 2 * 70 + 2 * (1 - $t) * $t * (-40) + $t ** 2 * 20;
        }
    }

    private function calculateConsumeCurveY(float $cx): float
    {
        if ($cx <= 170) {
            $t = $cx / 170;
            return (1 - $t) ** 2 * 170 + 2 * (1 - $t) * $t * 80 + $t ** 2 * 140;
        } elseif ($cx <= 330) {
            $t = ($cx - 170) / 160;
            return (1 - $t) ** 2 * 140 + 2 * (1 - $t) * $t * 200 + $t ** 2 * 100;
        } else {
            $t = ($cx - 330) / 170;
            return (1 - $t) ** 2 * 100 + 2 * (1 - $t) * $t * 0 + $t ** 2 * 50;
        }
    }

    private function calculateTagProducts(string $targetTag): array
    {
        $dbProducts = ProductModel::take(10)->get();
        $customTagProducts = [];

        if ($dbProducts->count() > 0) {
            foreach ($dbProducts as $prod) {
                $tag = 'Fast Moving';
                if ($prod->stock_qty <= 5) {
                    $tag = 'Low Demand';
                } elseif ($prod->discount_price && $prod->discount_price < $prod->price) {
                    $tag = 'Discounted';
                } elseif ($prod->created_at && $prod->created_at->diffInDays(now()) <= 14) {
                    $tag = 'New Arrival';
                }

                $customTagProducts[] = [
                    'id' => $prod->sku ?: 'SKU-' . str_pad($prod->id, 3, '0', STR_PAD_LEFT),
                    'name' => $prod->name,
                    'image' => $prod->image ?: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
                    'totalQty' => (int)$prod->stock_qty,
                    'stockIn' => max(0, (int)$prod->stock_qty - 10),
                    'price' => '$' . number_format($prod->price, 0),
                    'tag' => $tag,
                ];
            }
        }

        return $customTagProducts;
    }

    private function calculateSalesOrders(string $period): array
    {
        $recentOrders = OrderModel::with(['items.product'])->latest()->take(5)->get();
        $salesOrders = [];

        if ($recentOrders->count() > 0) {
            foreach ($recentOrders as $ord) {
                $priority = 'Medium';
                $priorityColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400';

                if ($ord->total >= 200) {
                    $priority = 'High';
                    $priorityColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400';
                } elseif ($ord->total < 50) {
                    $priority = 'Low';
                    $priorityColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400';
                }

                $firstItem = $ord->items->first();
                $name = 'Order #' . $ord->order_number;
                $stockText = 'Status: ' . ucfirst($ord->order_status);
                $image = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80';

                if ($firstItem) {
                    if (!empty($firstItem->product_name)) {
                        $name = $firstItem->product_name;
                    } elseif ($firstItem->product && !empty($firstItem->product->name)) {
                        $name = $firstItem->product->name;
                    }

                    if ($firstItem->product) {
                        $stockText = $firstItem->product->stock_qty > 5 
                            ? $firstItem->product->stock_qty . ' In Stock' 
                            : 'Low Stock (' . str_pad($firstItem->product->stock_qty, 2, '0', STR_PAD_LEFT) . ')';
                        
                        if (!empty($firstItem->product->image)) {
                            $image = $firstItem->product->image;
                        }
                    }
                }

                $salesOrders[] = [
                    'id' => $ord->id,
                    'name' => $name,
                    'stockText' => $stockText,
                    'price' => '$' . number_format($ord->total, 0),
                    'priority' => $priority,
                    'priorityColor' => $priorityColor,
                    'image' => $image,
                ];
            }
        }

        return $salesOrders;
    }
}

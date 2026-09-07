<?php

use App\Http\Controllers\AddressController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishListController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PromotionController;

Route::post('/register',[AuthController::class,'Register'])->middleware('throttle:register');
Route::post('/login',[AuthController::class,"login"]);
Route::post('/chat', [ChatController::class, 'chat']);

Route::apiResource('users', UserController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('product-images', ProductImageController::class);
Route::apiResource('roles', RoleController::class);
Route::apiResource('promotions', PromotionController::class);
Route::put('/promotions/{id}/toggle-status', [PromotionController::class, 'toggleStatus']);

use App\Http\Controllers\AbaPayWayController;

// Public / Dev Order Line endpoints
Route::get('/orders-list', [OrderController::class, 'getOrderLineData']);
Route::get('/user/orders', [OrderController::class, 'myOrders']);
Route::post('/orders-list/create', [OrderController::class, 'createAdminOrder']);
Route::put('/orders-list/{id}/status', [OrderController::class, 'updateOrderStatus']);
Route::post('/checkout', [OrderController::class, 'checkoutStore']);
Route::post('/payments/bakong/generate-qr', [PaymentController::class, 'generateBakongQr']);
Route::post('/payments/bakong/check-status', [PaymentController::class, 'checkBakongStatus']);
Route::post('/payments/bakong/verify', [PaymentController::class, 'verifyBakongPayment']);

// ABA PayWay Gateway Endpoints
Route::post('/payments/aba/generate-qr', [AbaPayWayController::class, 'generateQr']);
Route::post('/payments/aba/check-status', [AbaPayWayController::class, 'checkStatus']);
Route::post('/payments/aba/callback', [AbaPayWayController::class, 'handleCallback']);

// Public / Dev Dashboard endpoints
Route::prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/metrics', [DashboardController::class, 'getMetrics']);
    Route::get('/stock-chart', [DashboardController::class, 'getStockChart']);
    Route::get('/tag-products', [DashboardController::class, 'getTagProducts']);
    Route::get('/sales-orders', [DashboardController::class, 'getSalesOrders']);
    Route::get('/restock-recommendations', [DashboardController::class, 'getRestockRecommendations']);
});

// Inventory, Stock Audit & Analytics endpoints
Route::prefix('inventory')->group(function () {
    Route::get('/audit', [InventoryController::class, 'audit']);
    Route::put('/adjust-stock/{id}', [InventoryController::class, 'adjustStock']);
    Route::get('/analytics', [InventoryController::class, 'analytics']);
});

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/me',[AuthController::class,'me']);
    Route::post('/logout',[AuthController::class,'logout']);

    Route::apiResource('address',AddressController::class);
    Route::apiResource('carts',CartController::class);
    Route::apiResource('reviews',ReviewController::class);
    Route::apiResource('wishlists',WishListController::class);

    Route::apiResource('orders',OrderController::class);
    Route::apiResource('payments',PaymentController::class);
    Route::apiResource('shippings',ShippingController::class);
});

   

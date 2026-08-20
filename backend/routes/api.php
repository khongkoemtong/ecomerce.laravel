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

Route::post('/register',[AuthController::class,'Register'])->middleware('throttle:register');
Route::post('/login',[AuthController::class,"login"]);
Route::post('/chat', [ChatController::class, 'chat']);

Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('brands', BrandController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

// Public / Dev Order Line endpoints
Route::get('/orders-list', [OrderController::class, 'getOrderLineData']);
Route::post('/orders-list/create', [OrderController::class, 'createAdminOrder']);
Route::put('/orders-list/{id}/status', [OrderController::class, 'updateOrderStatus']);

// Public / Dev Dashboard endpoints
Route::prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/metrics', [DashboardController::class, 'getMetrics']);
    Route::get('/stock-chart', [DashboardController::class, 'getStockChart']);
    Route::get('/tag-products', [DashboardController::class, 'getTagProducts']);
    Route::get('/sales-orders', [DashboardController::class, 'getSalesOrders']);
    Route::get('/restock-recommendations', [DashboardController::class, 'getRestockRecommendations']);
});



Route::middleware('auth:sanctum')->group(function(){
    Route::get('/me',[AuthController::class,'me']);
    Route::post('/logout',[AuthController::class,'logout']);

    Route::apiResource('address',AddressController::class);
    Route::apiResource('carts',CartController::class);
    Route::apiResource('reviews',ReviewController::class);
    Route::apiResource('wishlists',WishListController::class);

    Route::apiResource('orders',OrderController::class)->only(['index', 'store', 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('roles',RoleController::class);
        Route::apiResource('users',UserController::class);
        Route::apiResource('categories',CategoryController::class)->except(['index', 'show']);
        Route::apiResource('brands',BrandController::class)->except(['index', 'show']);
        Route::apiResource('products',ProductController::class)->except(['index', 'show']);
        Route::apiResource('product-images',ProductImageController::class);
        Route::apiResource('orders',OrderController::class)->only(['update', 'destroy']);
        Route::apiResource('payments',PaymentController::class);
        Route::apiResource('shippings',ShippingController::class);
    });
});

   

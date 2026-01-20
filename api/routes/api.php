<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Webhooks\StripeWebhookController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Public routes: No authentication required
| Protected routes: Require Sanctum authentication token
*/

// Health check
Route::get('/health', function (Request $request) {
    return response()->json(['message' => 'I\'m alive!']);
});

// ===================================
// Authentication Routes (Public)
// ===================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ===================================
// Product Catalog Routes (Public Read, Protected Write)
// ===================================

// Products - Public read access
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Categories - Public read access
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);


// Cart Items
Route::middleware('optional.auth')->group(function () {
    Route::prefix('/cart')->group(function () {
        Route::prefix('/items')->group(function () {
            Route::post('/', [CartController::class, 'store']);
            Route::put('/{cartItem}', [CartController::class, 'updateItem']);
            Route::patch('/{cartItem}', [CartController::class, 'updateItem']);
            Route::delete('/{cartItem}', [CartController::class, 'destroyItem']);
        });

        Route::delete('/', [CartController::class, 'destroy']);
        Route::get('/', [CartController::class, 'index']);
    });
});

// ===================================
// Protected Routes (Require Authentication)
// ===================================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Products - Admin only (create, update, delete)
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Categories - Admin only (create, update, delete)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    
    
    // TODO: Add routes for Cart, Orders, Addresses, etc.

    // Stripe Checkout session
    Route::post('/payments/create-checkout-session', [PaymentController::class, 'createCheckoutSession']);
    Route::get('/payment/success', [PaymentController::class, 'paymentSuccess']);
    Route::get('/payment/cancel', [PaymentController::class, 'paymentCancel']);
});

Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handleWebhook']);

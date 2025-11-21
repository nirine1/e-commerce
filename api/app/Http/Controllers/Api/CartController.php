<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Http\Resources\CartItemResource;

/**
 * @OA\Tag(
 *     name="CartItem",
 *     description="Shopping cart endpoints - manage cart items"
 * )
 */
class CartController extends Controller
{
    /**
     * @OA\Post(
     *    path="/cart-items",
     *    operationId="store-cart-item",
     *    tags={"CartItem"},
     *    summary="Add item to cart",
     *    description="Adds a new item to the shopping cart (requires authentication or session ID for guests)",
     *    @OA\RequestBody(
     *       required=true,
     *       @OA\JsonContent(
     *         required={"product_id","quantity"},
     *         @OA\Property(
     *           property="product_id",
     *           type="integer",
     *           example=1,
     *           description="ID of the product to add"
     *         ),
     *         @OA\Property(
     *           property="quantity",
     *           type="integer",
     *           example=2,
     *           description="Quantity of the product to add"
     *         ),
     *         @OA\Property(
     *           property="session_id",
     *           type="string",
     *           example="abc123xyz",
     *           nullable=true,
     *           description="Session identifier for guest users"
     *         )
     *       )
     *    ),
     *    @OA\Response(
     *       response=201,
     *       description="Cart item created successfully",
     *       @OA\JsonContent(
     *         @OA\Property(
     *           property="data",
     *           type="object",
     *           @OA\Property(property="id", type="integer", example=1),
     *           @OA\Property(property="cart_id", type="integer", example=1),
     *           @OA\Property(property="product_id", type="integer", example=5),
     *           @OA\Property(property="quantity", type="integer", example=2),
     *           @OA\Property(property="price", type="number", format="float", example=29.99),
     *           @OA\Property(property="created_at", type="string", format="date-time"),
     *           @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *       )
     *    ),
     *    @OA\Response(response=400, description="Bad request"),
     *    @OA\Response(response=401, description="Unauthenticated"),
     *    @OA\Response(response=404, description="Product not found"),
     *    @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request) {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'session_id' => 'nullable|string'
        ]);

        $sessionId = $request->session()->getId() ?? $request->input('session_id');
        $userId = auth()->id();

        $cart = Cart::where(function($query) use ($sessionId, $userId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();

        if (!$cart) {
            $cart = Cart::create([
                'session_id' => $sessionId,
                'user_id' => $userId
            ]);
        }

        $product = Product::find($validated['product_id']);
        
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $existingItem = CartItem::where('cart_id', $cart->id)
                                ->where('product_id', $validated['product_id'])
                                ->first();

        if ($existingItem) {
            $existingItem->quantity += $validated['quantity'];
            $existingItem->save();
            $cartItem = $existingItem;
        } else {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'price' => $product->price
            ]);
        }

        $cartItem->load(['product']);

        return (new CartItemResource($cartItem))
            ->response()
            ->setStatusCode(201);
    }
}
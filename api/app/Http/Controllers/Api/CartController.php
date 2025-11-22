<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Http\Resources\CartItemResource;
use Illuminate\Support\Facades\Session;

/**
 * @OA\Tag(
 *     name="CartItem",
 *     description="Shopping cart endpoints - manage cart items (requires authentication or session ID for guests)"
 * )
 */
class CartController extends Controller
{
    /**
     * @OA\Post(
     *     path="/cart/items",
     *     operationId="store-cart-item",
     *     tags={"CartItem"},
     *     summary="Add item to cart",
     *     description="Adds a new item to the shopping cart",
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","quantity"},
     *             @OA\Property(
     *                 property="product_id",
     *                 type="integer",
     *                 example=1,
     *                 description="ID of the product to add"
     *             ),
     *             @OA\Property(
     *                 property="quantity",
     *                 type="integer",
     *                 example=2,
     *                 description="Quantity of the product to add"
     *             ),
     *             @OA\Property(
     *                 property="session_id",
     *                 type="string",
     *                 example="abc123xyz",
     *                 nullable=true,
     *                 description="Session identifier for guest users"
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Cart item created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 ref="#/components/schemas/CartItem"
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=400, description="Bad request"),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request) {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'session_id' => 'nullable|string'
        ]);

        if(auth()->id()) {
            // Authenticated user
            $request->merge(['session_id' => null]);
        } else if($request->has('session_id')) {
            // Guest user
            if (!$request->has('session_id')) {
                $request->merge(['session_id' => Session::getId()]);
            }
        } else {
            return response()->json(['error' => 'Session ID is required for guest users'], 400);
        }

        $sessionId = $request->input('session_id');
        $userId = auth()->id() ?? null;

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

    /**
     * @OA\Put(
     *     path="/cart/items/{cartItem}",
     *     operationId="update-cart-item",
     *     tags={"CartItem"},
     *     summary="Update cart item",
     *     description="Update the quantity of an existing cart item",
     *
     *     @OA\Parameter(
     *         name="cartItem",
     *         in="path",
     *         description="ID of the cart item to update",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="quantity",
     *                 type="integer",
     *                 example=3,
     *                 description="New quantity for this cart item"
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Cart item updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/CartItem")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Cart item not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, CartItem $cartItem) {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $validated['priece'] = $cartItem->product->price;
        $cartItem->update($validated);

        $cartItem->load(['product']);
        return new CartItemResource($cartItem);
    }
}
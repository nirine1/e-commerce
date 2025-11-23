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
 *     name="Cart Item",
 *     description="Shopping cart endpoints - manage cart items (requires authentication or session ID for guests)"
 * )
 */
class CartController extends Controller
{
    /**
     * @OA\Post(
     *     path="/cart/items",
     *     operationId="store-cart-item",
     *     tags={"Cart Item"},
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

        // Set session_id to null if user is authenticated
        if (auth()->id()) {
            $request->merge(['session_id' => null]);
        } else if($request->has('session_id')) {
            $sessionId = $request->input('session_id');
            $request->merge(['session_id' => $sessionId]);
        } else {
            return response()->json(['error' => 'Session ID is required for guest users'], 400);
        }

        $sessionId = $request->input('session_id');
        $cart = Cart::getUserCart($sessionId);
        
        if (!$cart) {
            $cart = Cart::create([
                'session_id' => $sessionId,
                'user_id' => auth()->id()
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
            $existingItem->quantity = $validated['quantity'];
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
     *     tags={"Cart Item"},
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
    public function updateItem(Request $request, CartItem $cartItem) {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        // Get cart of authenticated user or guest
        $sessionId = $request->input('session_id') ?? null;
        $cart = Cart::getUserCart($sessionId);
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }
        // Check if the cart item belongs to the user's cart
        if ($cartItem->cart_id !== $cart->id) {
            return response()->json(['message' => 'Cart item doesn\'t belong to the user authenticated'], 404);
        }   
        
        $validated['price'] = $cartItem->product->price;
        $cartItem->update($validated);

        $cartItem->load(['product']);
        return new CartItemResource($cartItem);
    }

    /**
     * @OA\Delete(
     *     path="/cart/items/{cartItem}",
     *     operationId="delete-cart-item",
     *     tags={"Cart Item"},
     *     summary="Delete a Cart Item",
     *     description="Delete an existing cart item by ID",
     *     @OA\Parameter(
     *         name="cartItem",
     *         in="path",
     *         description="Cart Item ID",
     *         required=true,
     *         @OA\Schema(
     *             oneOf={
     *                 @OA\Schema(type="integer", example=1),
     *             }
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cart Item deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cart Item deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Cart Item not found")
     * )
     */
    public function destroy(Request $request, CartItem $cartItem) {
        // Get cart of authenticated user or guest
        $sessionId = $request->input('session_id') ?? null;
        $cart = Cart::getUserCart($sessionId);
        
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }
        
        // Check if the cart item belongs to the user's cart
        if ($cartItem->cart_id !== $cart->id) {
            return response()->json(['message' => 'Cart item doesn\'t belong to the user authenticated'], 404);
        }
        
        $cartItem->delete();
        
        return response()->json([
            'message' => 'Cart Item deleted successfully'
        ], 200);
    }
}
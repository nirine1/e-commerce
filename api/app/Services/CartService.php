<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartService
{
    /**
     * Get session ID from request or authenticated user
     */
    public function getSessionId(Request $request): ?string
    {
        return $request->input('session_id');
    }

    /**
     * Get user's cart (authenticated or guest)
     */
    public function getUserCart(?string $sessionId): ?Cart
    {
        if (Auth::check()) {
            return Cart::with('items.product')->where('user_id', Auth::id())->first();
        }

        if ($sessionId) {
            return Cart::with('items.product')->where('session_id', $sessionId)->first();
        }

        return null;
    }

    /**
     * Add item to cart or update quantity if exists
     */
    public function addItem(int $productId, int $quantity, ?string $sessionId): CartItem
    {
        $product = Product::findOrFail($productId);

        if (! $product->is_active) {
            throw new \Exception('Product is not available');
        }

        $cart = $this->getOrCreateCart($sessionId);

        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $quantity;

            if ($newQuantity > $product->quantity) {
                throw new \Exception('Insufficient stock');
            }

            $existingItem->quantity = $newQuantity;
            $existingItem->save();
            $existingItem->load('product');

            return $existingItem;
        }

        if ($quantity > $product->quantity) {
            throw new \Exception('Insufficient stock');
        }

        $cartItem = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $productId,
            'quantity' => $quantity,
            'price' => $product->price,
        ]);

        $cartItem->load('product');

        return $cartItem;
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(CartItem $cartItem, int $quantity): CartItem
    {
        $cartItem->update(['quantity' => $quantity]);

        return $cartItem->fresh('product');
    }

    /**
     * Remove item from cart
     */
    public function removeItem(CartItem $cartItem): void
    {
        $cartItem->delete();
    }

    /**
     * Clear entire cart
     */
    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
        $cart->delete();
    }

    /**
     * Verify cart item ownership
     */
    public function verifyCartItemOwnership(CartItem $cartItem, ?string $sessionId): bool
    {
        $cart = $cartItem->cart;

        if (Auth::check()) {
            return $cart->user_id === Auth::id();
        }

        if ($sessionId) {
            return $cart->session_id === $sessionId;
        }

        return false;
    }

    /**
     * Verify cart ownership
     */
    public function verifyCartOwnership(Cart $cart, ?string $sessionId): bool
    {
        if (Auth::check()) {
            return $cart->user_id === Auth::id();
        }

        if ($sessionId) {
            return $cart->session_id === $sessionId;
        }

        return false;
    }

    /**
     * Get or create cart for user/session
     */
    private function getOrCreateCart(?string $sessionId): Cart
    {
        if (Auth::check()) {
            return Cart::firstOrCreate(
                ['user_id' => Auth::id()],
                ['session_id' => null]
            );
        }

        if ($sessionId) {
            return Cart::firstOrCreate(
                ['session_id' => $sessionId],
                ['user_id' => null]
            );
        }

        throw new \Exception('Either user must be authenticated or session_id must be provided');
    }
}

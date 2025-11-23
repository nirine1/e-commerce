<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CartResource;

class CartService
{
    /**
     * Get session ID based on authentication status
     */
    public function getSessionId(Request $request): ?string
    {
        if (Auth::check()) {
            return null;
        }
        
        return $request->input('session_id') 
            ?? abort(400, 'Session ID is required for guest users');
    }

    /**
     * Get or create cart for user/guest
     */
    public function getOrCreateCart(?string $sessionId): Cart
    {
        return $this->getUserCart($sessionId) 
            ?? Cart::create([
                'session_id' => $sessionId,
                'user_id' => Auth::id()
            ]);
    }

    /**
     * Add or update item in cart
     */
    public function addItem(int $productId, int $quantity, ?string $sessionId): CartItem
    {
        $cart = $this->getOrCreateCart($sessionId);
        $product = Product::findOrFail($productId);
        
        return CartItem::updateOrCreate(
            [
                'cart_id' => $cart->id,
                'product_id' => $productId
            ],
            [
                'quantity' => $quantity,
                'price' => $product->price
            ]
        );
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(CartItem $cartItem, int $quantity): CartItem
    {
        $cartItem->update([
            'quantity' => $quantity,
            'price' => $cartItem->product->price
        ]);

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
        $cart->delete();
    }

    /**
     * Verify cart belongs to current user/session
     */
    public function verifyCartOwnership(Cart $cart, Request $request): bool
    {
        $isAuthenticated = Auth::check() && $cart->user_id === Auth::id();
        $isGuest = !Auth::check() && $cart->session_id === $request->input('session_id');
        
        return $isAuthenticated || $isGuest;
    }

    /**
     * Verify cart item belongs to current user/session
     */
    public function verifyCartItemOwnership(CartItem $cartItem, ?string $sessionId): bool
    {
        $cart = $this->getUserCart($sessionId);
        
        return $cart && $cartItem->cart_id === $cart->id;
    }

    /**
     * Get user cart by session or user ID
     */
    public function getUserCart(?string $sessionId): ?Cart
    {
        $userId = Auth::id();

        return Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
    }

    public function getUserCartResource(?string $sessionId)
    {
        $cart = $this->getUserCart($sessionId);
        if( !$cart ) {
            return null;
        } else {
            $cart->load('items');
            return new CartResource($cart);
        }
    }

}
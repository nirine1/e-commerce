<?php

namespace Tests\Feature\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Cart\Traits\HasCartSetup;
use Tests\TestCase;

class CartDeleteTest extends TestCase
{
    use RefreshDatabase, HasCartSetup;

    public function test_authenticated_user_can_delete_entire_cart(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        
        // Create 3 DIFFERENT products in the cart
        $products = Product::factory()->count(3)->create(['is_active' => true]);
        foreach ($products as $product) {
            CartItem::factory()->create([
                'cart_id' => $cart->id,
                'product_id' => $product->id
            ]);
        }

        $response = $this->actingAs($this->user)
                        ->deleteJson('/api/cart');

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Cart deleted successfully'
                ]);

        // Verify all cart items are deleted
        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $cart->id
        ]);

        // Verify cart is deleted
        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id
        ]);
    }

    public function test_guest_can_delete_cart_with_valid_session_id(): void
    {
        $sessionId = 'guest-session-clear';
        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        
        // Create 2 DIFFERENT products in the cart
        $products = Product::factory()->count(2)->create(['is_active' => true]);
        foreach ($products as $product) {
            CartItem::factory()->create([
                'cart_id' => $cart->id,
                'product_id' => $product->id
            ]);
        }

        $response = $this->deleteJson('/api/cart', [
            'session_id' => $sessionId
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Cart deleted successfully'
                ]);

        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id
        ]);
    }

    public function test_user_cannot_delete_another_users_cart(): void
    {
        $otherUser = User::factory()->create();
        $otherCart = Cart::factory()->create(['user_id' => $otherUser->id]);
        CartItem::factory()->create([
            'cart_id' => $otherCart->id,
            'product_id' => $this->product->id
        ]);

        $response = $this->actingAs($this->user)
                         ->deleteJson('/api/cart');

        $response->assertStatus(404);

        // Verify other user's cart still exists
        $this->assertDatabaseHas('carts', [
            'id' => $otherCart->id
        ]);
    }

    public function test_delete_cart_returns_404_when_cart_does_not_exist(): void
    {
        $response = $this->actingAs($this->user)
                         ->deleteJson('/api/cart');

        $response->assertStatus(404);
    }

    public function test_guest_cannot_delete_cart_with_wrong_session_id(): void
    {
        $sessionId = 'session-correct';
        $wrongSessionId = 'session-wrong';
        
        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id
        ]);

        $response = $this->deleteJson('/api/cart', [
            'session_id' => $wrongSessionId
        ]);

        $response->assertStatus(403);

        // Verify cart still exists
        $this->assertDatabaseHas('carts', [
            'id' => $cart->id
        ]);
    }
}
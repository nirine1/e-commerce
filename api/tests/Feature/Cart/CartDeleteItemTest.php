<?php

namespace Tests\Feature\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Cart\Traits\HasCartSetup;
use Tests\TestCase;

class CartDeleteItemTest extends TestCase
{
    use RefreshDatabase, HasCartSetup;

    public function test_authenticated_user_can_delete_cart_item(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $response = $this->actingAs($this->user)
                         ->deleteJson('/api/cart/items/' . $cartItem->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Cart item deleted successfully'
                 ]);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id
        ]);
    }

    public function test_guest_can_delete_cart_item_with_valid_session_id(): void
    {
        $sessionId = 'guest-session-delete';
        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1
        ]);

        $response = $this->deleteJson('/api/cart/items/' . $cartItem->id, [
            'session_id' => $sessionId
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Cart item deleted successfully'
                 ]);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id
        ]);
    }

    public function test_user_cannot_delete_another_users_cart_item(): void
    {
        $otherUser = User::factory()->create();
        $otherCart = Cart::factory()->create(['user_id' => $otherUser->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $otherCart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $response = $this->actingAs($this->user)
                         ->deleteJson('/api/cart/items/' . $cartItem->id);

        $response->assertStatus(403);

        // Verify item still exists
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id
        ]);
    }

    public function test_delete_cart_item_returns_404_for_nonexistent_item(): void
    {
        $response = $this->actingAs($this->user)
                         ->deleteJson('/api/cart/items/99999');

        $response->assertStatus(404);
    }
}
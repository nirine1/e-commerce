<?php

namespace Tests\Feature\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Cart\Traits\HasCartSetup;
use Tests\TestCase;

class CartUpdateItemTest extends TestCase
{
    use HasCartSetup, RefreshDatabase;

    public function test_authenticated_user_can_update_cart_item_quantity(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $data = ['quantity' => 5];

        $response = $this->actingAs($this->user)
            ->putJson('/api/cart/items/'.$cartItem->id, $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $cartItem->id)
            ->assertJsonPath('data.quantity', 5);

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 5,
        ]);
    }

    public function test_guest_can_update_cart_item_with_valid_session_id(): void
    {
        $sessionId = 'guest-session-789';
        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $data = [
            'quantity' => 4,
            'session_id' => $sessionId,
        ];

        $response = $this->putJson('/api/cart/items/'.$cartItem->id, $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.quantity', 4);

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 4,
        ]);
    }

    public function test_user_cannot_update_another_users_cart_item(): void
    {
        $otherUser = User::factory()->create();
        $otherCart = Cart::factory()->create(['user_id' => $otherUser->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $otherCart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $data = ['quantity' => 10];

        $response = $this->actingAs($this->user)
            ->putJson('/api/cart/items/'.$cartItem->id, $data);

        $response->assertStatus(403);

        // Verify quantity was not changed
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 2,
        ]);
    }

    public function test_guest_cannot_update_cart_item_with_wrong_session_id(): void
    {
        $sessionId = 'session-correct';
        $wrongSessionId = 'session-wrong';

        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $data = [
            'quantity' => 10,
            'session_id' => $wrongSessionId,
        ];

        $response = $this->putJson('/api/cart/items/'.$cartItem->id, $data);

        $response->assertStatus(403);
    }

    public function test_update_cart_item_fails_with_invalid_quantity(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $data = ['quantity' => 0];

        $response = $this->actingAs($this->user)
            ->putJson('/api/cart/items/'.$cartItem->id, $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_patch_method_also_updates_cart_item(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 3,
        ]);

        $data = ['quantity' => 7];

        $response = $this->actingAs($this->user)
            ->patchJson('/api/cart/items/'.$cartItem->id, $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.quantity', 7);
    }
}

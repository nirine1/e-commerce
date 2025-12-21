<?php

namespace Tests\Feature\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Cart\Traits\HasCartSetup;
use Tests\TestCase;

class CartIndexTest extends TestCase
{
    use RefreshDatabase, HasCartSetup;

    public function test_authenticated_user_can_get_their_cart(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $response = $this->actingAs($this->user)
                         ->getJson('/api/cart');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'user_id',
                         'session_id',
                         'items' => [
                             '*' => [
                                 'id',
                                 'product_id',
                                 'quantity',
                                 'price',
                                 'product'
                             ]
                         ],
                         'created_at',
                         'updated_at'
                     ]
                 ]);
    }

    public function test_guest_can_get_cart_with_session_id(): void
    {
        $sessionId = 'guest-session-123';
        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1
        ]);

        $response = $this->getJson('/api/cart?session_id=' . $sessionId);

        $response->assertStatus(200)
                 ->assertJsonPath('data.session_id', $sessionId);
    }

    public function test_get_cart_returns_empty_cart_when_no_cart_exists(): void
    {
        $response = $this->actingAs($this->user)
                         ->getJson('/api/cart');

        $response->assertStatus(200);
    }

    public function test_guest_without_session_id_gets_empty_cart(): void
    {
        $response = $this->getJson('/api/cart');

        $response->assertStatus(200);
    }
}
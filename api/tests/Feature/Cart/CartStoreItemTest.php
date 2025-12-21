<?php

namespace Tests\Feature\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Cart\Traits\HasCartSetup;
use Tests\TestCase;

class CartStoreItemTest extends TestCase
{
    use RefreshDatabase, HasCartSetup;

    public function test_authenticated_user_can_add_item_to_cart(): void
    {
        $data = [
            'product_id' => $this->product->id,
            'quantity' => 3
        ];

        $response = $this->actingAs($this->user)
                         ->postJson('/api/cart/items', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'cart_id',
                         'product_id',
                         'quantity',
                         'price',
                         'product'
                     ]
                 ])
                 ->assertJsonPath('data.product_id', $this->product->id)
                 ->assertJsonPath('data.quantity', 3);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 3
        ]);
    }

    public function test_guest_can_add_item_to_cart_with_session_id(): void
    {
        $sessionId = 'guest-session-456';
        $data = [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'session_id' => $sessionId
        ];

        $response = $this->postJson('/api/cart/items', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.product_id', $this->product->id)
                 ->assertJsonPath('data.quantity', 2);

        $this->assertDatabaseHas('carts', [
            'session_id' => $sessionId
        ]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);
    }

    public function test_adding_existing_product_increases_quantity(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $data = [
            'product_id' => $this->product->id,
            'quantity' => 3
        ];

        $response = $this->actingAs($this->user)
                        ->postJson('/api/cart/items', $data);

        // When adding to an existing item, we get 200 (update), not 201 (create)
        $response->assertStatus(200)
                ->assertJsonPath('data.product_id', $this->product->id)
                ->assertJsonPath('data.quantity', 5); // 2 + 3 = 5

        // Verify the quantity was increased (2 + 3 = 5)
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 5
        ]);
        
        // Verify we still have only ONE cart item (not two)
        $this->assertDatabaseCount('cart_items', 1);
    }

    public function test_add_item_fails_with_invalid_product_id(): void
    {
        $data = [
            'product_id' => 99999,
            'quantity' => 1
        ];

        $response = $this->actingAs($this->user)
                         ->postJson('/api/cart/items', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['product_id']);
    }

    public function test_add_item_fails_with_missing_quantity(): void
    {
        $data = [
            'product_id' => $this->product->id
        ];

        $response = $this->actingAs($this->user)
                         ->postJson('/api/cart/items', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }

    public function test_add_item_fails_with_zero_quantity(): void
    {
        $data = [
            'product_id' => $this->product->id,
            'quantity' => 0
        ];

        $response = $this->actingAs($this->user)
                         ->postJson('/api/cart/items', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }

    public function test_add_item_fails_with_negative_quantity(): void
    {
        $data = [
            'product_id' => $this->product->id,
            'quantity' => -5
        ];

        $response = $this->actingAs($this->user)
                         ->postJson('/api/cart/items', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }
}
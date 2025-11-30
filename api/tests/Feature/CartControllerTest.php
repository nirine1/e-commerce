<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create user and product for tests
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'price' => 99.99,
            'quantity' => 100,
            'is_active' => true
        ]);
    }

    // ==================== INDEX TESTS (GET /cart) ====================

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

    // ==================== STORE TESTS (POST /cart/items) ====================

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

    // ==================== UPDATE TESTS (PUT /cart/items/{cartItem}) ====================

    public function test_authenticated_user_can_update_cart_item_quantity(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $data = ['quantity' => 5];

        $response = $this->actingAs($this->user)
                         ->putJson('/api/cart/items/' . $cartItem->id, $data);

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $cartItem->id)
                 ->assertJsonPath('data.quantity', 5);

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 5
        ]);
    }

    public function test_guest_can_update_cart_item_with_valid_session_id(): void
    {
        $sessionId = 'guest-session-789';
        $cart = Cart::factory()->create(['session_id' => $sessionId]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1
        ]);

        $data = [
            'quantity' => 4,
            'session_id' => $sessionId
        ];

        $response = $this->putJson('/api/cart/items/' . $cartItem->id, $data);

        $response->assertStatus(200)
                 ->assertJsonPath('data.quantity', 4);

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 4
        ]);
    }

    public function test_user_cannot_update_another_users_cart_item(): void
    {
        $otherUser = User::factory()->create();
        $otherCart = Cart::factory()->create(['user_id' => $otherUser->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $otherCart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $data = ['quantity' => 10];

        $response = $this->actingAs($this->user)
                         ->putJson('/api/cart/items/' . $cartItem->id, $data);

        $response->assertStatus(403);

        // Verify quantity was not changed
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 2
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
            'quantity' => 2
        ]);

        $data = [
            'quantity' => 10,
            'session_id' => $wrongSessionId
        ];

        $response = $this->putJson('/api/cart/items/' . $cartItem->id, $data);

        $response->assertStatus(403);
    }

    public function test_update_cart_item_fails_with_invalid_quantity(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2
        ]);

        $data = ['quantity' => 0];

        $response = $this->actingAs($this->user)
                         ->putJson('/api/cart/items/' . $cartItem->id, $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }

    public function test_patch_method_also_updates_cart_item(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 3
        ]);

        $data = ['quantity' => 7];

        $response = $this->actingAs($this->user)
                         ->patchJson('/api/cart/items/' . $cartItem->id, $data);

        $response->assertStatus(200)
                 ->assertJsonPath('data.quantity', 7);
    }

    // ==================== DELETE ITEM TESTS (DELETE /cart/items/{cartItem}) ====================

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

    // ==================== DELETE CART TESTS (DELETE /cart) ====================
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
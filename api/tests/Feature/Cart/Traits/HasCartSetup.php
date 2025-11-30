<?php

namespace Tests\Feature\Cart\Traits;

use App\Models\Product;
use App\Models\User;

trait HasCartSetup
{
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
}
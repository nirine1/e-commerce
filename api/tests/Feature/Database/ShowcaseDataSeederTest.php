<?php

namespace Tests\Feature\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\ShowcaseDataSeeder;
use Database\Seeders\RevertDataSeeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;

class ShowcaseDataSeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that ShowcaseDataSeeder creates all expected users
     */
    public function test_showcase_seeder_creates_admin_and_regular_users(): void
    {
        // Run the seeder
        $this->seed(ShowcaseDataSeeder::class);

        // Assert admin user exists
        $admin = User::where('email', 'admin@showcase.test')->first();
        $this->assertNotNull($admin);
        $this->assertEquals('Admin User', $admin->name);

        // Assert 5 regular users exist
        $regularUsers = User::where('email', 'like', '%@showcase.test')
            ->where('email', '!=', 'admin@showcase.test')
            ->get();

        $this->assertCount(5, $regularUsers);

        // Check one specific user
        $john = User::where('email', 'john.doe@showcase.test')->first();
        $this->assertNotNull($john);
        $this->assertEquals('John Doe', $john->name);
        $this->assertEquals('1995-05-15', $john->date_of_birth->format('Y-m-d'));
    }

    /**
     * Test that ShowcaseDataSeeder creates hierarchical categories
     */
    public function test_showcase_seeder_creates_hierarchical_categories(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check root categories exist
        $electronics = Category::where('slug', 'electronics')->first();
        $this->assertNotNull($electronics);
        $this->assertNull($electronics->parent_id);
        $this->assertTrue($electronics->is_active);

        // Check child categories exist
        $laptops = Category::where('slug', 'laptops')->first();
        $this->assertNotNull($laptops);
        $this->assertEquals($electronics->id, $laptops->parent_id);

        // Check total categories (10 categories created)
        $totalCategories = Category::count();
        $this->assertEquals(10, $totalCategories);

        // Check inactive category exists
        $inactive = Category::where('slug', 'inactive-category')->first();
        $this->assertNotNull($inactive);
        $this->assertFalse($inactive->is_active);
    }

    /**
     * Test that ShowcaseDataSeeder creates products with varied attributes
     */
    public function test_showcase_seeder_creates_varied_products(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check total products (50 products)
        $totalProducts = Product::count();
        $this->assertEquals(50, $totalProducts);

        // Check featured products exist
        $featuredProducts = Product::where('is_featured', true)->get();
        $this->assertGreaterThan(0, $featuredProducts->count());

        // Check specific products
        $macbook = Product::where('sku', 'LAPTOP-001')->first();
        $this->assertNotNull($macbook);
        $this->assertEquals('MacBook Pro 16"', $macbook->name);
        $this->assertEquals(2499.99, (float) $macbook->price);
        $this->assertEquals(15, $macbook->quantity);
        $this->assertTrue($macbook->is_featured);

        // Check out of stock product
        $outOfStock = Product::where('sku', 'WATCH-001')->first();
        $this->assertNotNull($outOfStock);
        $this->assertEquals(0, $outOfStock->quantity);

        // Check inactive product
        $inactive = Product::where('sku', 'DISC-001')->first();
        $this->assertNotNull($inactive);
        $this->assertFalse($inactive->is_active);

        // Check products have slugs
        foreach (Product::all() as $product) {
            $this->assertNotNull($product->slug);
        }
    }

    /**
     * Test that ShowcaseDataSeeder creates product images
     */
    public function test_showcase_seeder_creates_product_images(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check that images exist
        $totalImages = ProductImage::count();
        $this->assertGreaterThan(0, $totalImages);

        // Check that a specific product has images
        $macbook = Product::where('sku', 'LAPTOP-001')->first();
        $this->assertGreaterThan(0, $macbook->images()->count());

        // Check that first image is primary
        $primaryImage = $macbook->images()->where('is_primary', true)->first();
        $this->assertNotNull($primaryImage);

        // Check image has proper fields
        $this->assertNotNull($primaryImage->image_path);
        $this->assertNotNull($primaryImage->alt_text);
    }

    /**
     * Test that ShowcaseDataSeeder creates product-category relationships
     */
    public function test_showcase_seeder_creates_product_category_relationships(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check that products have categories
        $macbook = Product::where('sku', 'LAPTOP-001')->first();
        $this->assertGreaterThan(0, $macbook->categories()->count());

        // Check that laptop is in laptops category
        $laptopsCategory = Category::where('slug', 'laptops')->first();
        $this->assertTrue($macbook->categories->contains($laptopsCategory));
    }

    /**
     * Test that ShowcaseDataSeeder creates user addresses
     */
    public function test_showcase_seeder_creates_addresses(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check addresses exist
        $totalAddresses = Address::count();
        $this->assertGreaterThan(0, $totalAddresses);

        // Check user has addresses (skip admin, check regular users)
        $john = User::where('email', 'john.doe@showcase.test')->first();
        $this->assertGreaterThan(0, $john->addresses()->count());

        // Check default address exists
        $defaultAddress = $john->addresses()->where('is_default', true)->first();
        $this->assertNotNull($defaultAddress);
        $this->assertEquals('US', $defaultAddress->country);
    }

    /**
     * Test that ShowcaseDataSeeder creates shopping carts
     */
    public function test_showcase_seeder_creates_shopping_carts(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check carts exist
        $totalCarts = Cart::count();
        $this->assertGreaterThan(0, $totalCarts);

        // Check cart has items
        $cart = Cart::first();
        $this->assertGreaterThan(0, $cart->items()->count());

        // Check cart item has valid data
        $cartItem = $cart->items()->first();
        $this->assertNotNull($cartItem->product_id);
        $this->assertGreaterThan(0, $cartItem->quantity);
        $this->assertGreaterThan(0, $cartItem->price);
    }

    /**
     * Test that ShowcaseDataSeeder creates orders with items
     */
    public function test_showcase_seeder_creates_orders_with_items(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check orders exist
        $totalOrders = Order::count();
        $this->assertEquals(15, $totalOrders); // 3 users × 5 orders each

        // Check various statuses exist
        $statuses = Order::distinct()->pluck('status')->toArray();
        $this->assertContains('pending', $statuses);
        $this->assertContains('processing', $statuses);
        $this->assertContains('shipped', $statuses);
        $this->assertContains('delivered', $statuses);
        $this->assertContains('cancelled', $statuses);

        // Check order has items
        $order = Order::first();
        $this->assertGreaterThan(0, $order->items()->count());

        // Check order totals are calculated
        $this->assertGreaterThan(0, $order->subtotal);
        $this->assertGreaterThan(0, $order->total_amount);
        $this->assertEquals(15.00, (float) $order->shipping_amount);

        // Check shipped order has shipped_at timestamp
        $shippedOrder = Order::where('status', 'shipped')->first();
        if ($shippedOrder) {
            $this->assertNotNull($shippedOrder->shipped_at);
        }

        // Check delivered order has delivered_at timestamp
        $deliveredOrder = Order::where('status', 'delivered')->first();
        if ($deliveredOrder) {
            $this->assertNotNull($deliveredOrder->delivered_at);
        }
    }

    /**
     * Test that ShowcaseDataSeeder creates wishlists
     */
    public function test_showcase_seeder_creates_wishlists(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check wishlist entries exist
        $totalWishlistEntries = DB::table('wishlists')->count();
        $this->assertGreaterThan(0, $totalWishlistEntries);

        // Check user has wishlist items
        $john = User::where('email', 'john.doe@showcase.test')->first();
        $wishlistProducts = DB::table('wishlists')
            ->where('user_id', $john->id)
            ->get();

        $this->assertGreaterThan(0, $wishlistProducts->count());
    }

    /**
     * Test that ShowcaseDataSeeder creates data with proper relationships
     */
    public function test_showcase_seeder_maintains_referential_integrity(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check cart items reference valid products
        $cartItems = CartItem::all();
        foreach ($cartItems as $item) {
            $this->assertNotNull(Product::find($item->product_id));
        }

        // Check order items reference valid products
        $orderItems = OrderItem::all();
        foreach ($orderItems as $item) {
            $this->assertNotNull(Product::find($item->product_id));
        }

        // Check addresses belong to valid users
        $addresses = Address::all();
        foreach ($addresses as $address) {
            $this->assertNotNull(User::find($address->user_id));
        }

        // Check orders belong to valid users
        $orders = Order::all();
        foreach ($orders as $order) {
            $this->assertNotNull(User::find($order->user_id));
        }
    }

    /**
     * Test RevertDataSeeder identifies correct users to delete
     */
    public function test_revert_seeder_identifies_showcase_users(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Get showcase users before revert
        $showcaseUsersBefore = User::where('email', 'like', '%@showcase.test')->get();
        $this->assertGreaterThan(0, $showcaseUsersBefore->count());

        // Run revert
        $this->seed(RevertDataSeeder::class);

        // Check showcase users are deleted
        $showcaseUsersAfter = User::where('email', 'like', '%@showcase.test')->get();
        $this->assertCount(0, $showcaseUsersAfter);
    }

    /**
     * Test RevertDataSeeder deletes all showcase data
     */
    public function test_revert_seeder_deletes_all_showcase_data(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Verify data exists
        $this->assertGreaterThan(0, User::where('email', 'like', '%@showcase.test')->count());
        $this->assertGreaterThan(0, Product::count());
        $this->assertGreaterThan(0, Category::count());
        $this->assertGreaterThan(0, Order::count());
        $this->assertGreaterThan(0, Cart::count());

        // Run revert
        $this->seed(RevertDataSeeder::class);

        // Check all showcase data is deleted
        $this->assertEquals(0, User::where('email', 'like', '%@showcase.test')->count());

        // Check products are deleted (by SKU prefix)
        $skuPrefixes = ['LAPTOP-%', 'PHONE-%', 'ACC-%', 'MEN-%', 'WOMEN-%', 'BOOK-%', 'HOME-%', 'WATCH-%', 'DISC-%', 'SAMPLE-%'];
        $products = Product::where(function ($query) use ($skuPrefixes) {
            foreach ($skuPrefixes as $prefix) {
                $query->orWhere('sku', 'like', $prefix);
            }
        })->count();
        $this->assertEquals(0, $products);

        // Check categories are deleted
        $categoryCount = Category::whereIn('slug', [
            'electronics', 'clothing', 'books', 'home-garden',
            'laptops', 'smartphones', 'accessories',
            'mens-clothing', 'womens-clothing', 'inactive-category'
        ])->count();
        $this->assertEquals(0, $categoryCount);
    }

    /**
     * Test RevertDataSeeder statistics method
     */
    public function test_revert_seeder_statistics_method(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        $revertSeeder = new RevertDataSeeder();
        $stats = $revertSeeder->getStatistics();

        // Check statistics contain expected keys
        $this->assertArrayHasKey('users', $stats);
        $this->assertArrayHasKey('products', $stats);
        $this->assertArrayHasKey('categories', $stats);
        $this->assertArrayHasKey('orders', $stats);
        $this->assertArrayHasKey('carts', $stats);
        $this->assertArrayHasKey('addresses', $stats);
        $this->assertArrayHasKey('wishlists', $stats);

        // Check counts are correct
        $this->assertEquals(6, $stats['users']); // 1 admin + 5 regular
        $this->assertEquals(50, $stats['products']);
        $this->assertEquals(10, $stats['categories']);
        $this->assertEquals(15, $stats['orders']);
        $this->assertGreaterThan(0, $stats['carts']);
        $this->assertGreaterThan(0, $stats['addresses']);
        $this->assertGreaterThan(0, $stats['wishlists']);
    }

    /**
     * Test RevertDataSeeder returns empty statistics when no data exists
     */
    public function test_revert_seeder_statistics_returns_zero_when_no_data(): void
    {
        // Don't seed any data

        $revertSeeder = new RevertDataSeeder();
        $stats = $revertSeeder->getStatistics();

        // All counts should be 0
        $this->assertEquals(0, $stats['users']);
        $this->assertEquals(0, $stats['products']);
        $this->assertEquals(0, $stats['categories']);
        $this->assertEquals(0, $stats['orders']);
        $this->assertEquals(0, $stats['carts']);
        $this->assertEquals(0, $stats['addresses']);
        $this->assertEquals(0, $stats['wishlists']);
    }

    /**
     * Test full cycle: seed and revert
     */
    public function test_full_cycle_seed_and_revert(): void
    {
        // Initial state - no data
        $this->assertEquals(0, User::count());
        $this->assertEquals(0, Product::count());
        $this->assertEquals(0, Category::count());

        // Seed showcase data
        $this->seed(ShowcaseDataSeeder::class);

        // Verify data exists
        $this->assertGreaterThan(0, User::count());
        $this->assertGreaterThan(0, Product::count());
        $this->assertGreaterThan(0, Category::count());

        // Revert showcase data
        $this->seed(RevertDataSeeder::class);

        // Verify showcase data is removed
        $this->assertEquals(0, User::where('email', 'like', '%@showcase.test')->count());

        // Note: Products and categories are also removed because they were created by showcase seeder
        $this->assertEquals(0, Product::count());
        $this->assertEquals(0, Category::count());
    }

    /**
     * Test that RevertDataSeeder doesn't delete non-showcase data
     */
    public function test_revert_seeder_preserves_non_showcase_data(): void
    {
        // Create non-showcase user (using forceCreate to bypass mass assignment protection)
        $normalUser = User::forceCreate([
            'name' => 'Normal User',
            'email' => 'normal@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create non-showcase product (using forceCreate to set slug)
        $normalProduct = Product::forceCreate([
            'name' => 'Normal Product',
            'slug' => 'normal-product',
            'sku' => 'NORMAL-001',
            'price' => 99.99,
            'quantity' => 10,
        ]);

        // Seed showcase data
        $this->seed(ShowcaseDataSeeder::class);

        // Run revert
        $this->seed(RevertDataSeeder::class);

        // Check normal user and product still exist
        $this->assertNotNull(User::find($normalUser->id));
        $this->assertNotNull(Product::find($normalProduct->id));

        // Check showcase data is deleted
        $this->assertEquals(0, User::where('email', 'like', '%@showcase.test')->count());
    }

    /**
     * Test that products have proper dimensions
     */
    public function test_showcase_seeder_creates_products_with_dimensions(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check products with weight
        $mouse = Product::where('sku', 'ACC-001')->first();
        $this->assertNotNull($mouse);
        $this->assertEquals(0.15, (float) $mouse->weight);
    }

    /**
     * Test that seeder creates price comparisons
     */
    public function test_showcase_seeder_creates_price_comparisons(): void
    {
        $this->seed(ShowcaseDataSeeder::class);

        // Check product with compare_price
        $macbook = Product::where('sku', 'LAPTOP-001')->first();
        $this->assertNotNull($macbook->compare_price);
        $this->assertGreaterThan($macbook->price, $macbook->compare_price);
    }
}

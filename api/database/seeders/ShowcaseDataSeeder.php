<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;

class ShowcaseDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates comprehensive e-commerce data for testing:
     * - 1 Admin user
     * - 5 Regular users
     * - 10 Categories (hierarchical)
     * - 50 Products with images
     * - Shopping carts with items
     * - Orders in various statuses
     * - User addresses
     * - Wishlists
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Create Users
            $users = $this->seedUsers();

            // 2. Create Categories
            $categories = $this->seedCategories();

            // 3. Create Products
            $products = $this->seedProducts($categories);

            // 4. Create Product Images
            $this->seedProductImages($products);

            // 5. Create Addresses
            $this->seedAddresses($users);

            // 6. Create Shopping Carts
            $this->seedCarts($users, $products);

            // 7. Create Orders
            $this->seedOrders($users, $products);

            // 8. Create Wishlists
            $this->seedWishlists($users, $products);
        });

        $this->command->info('✅ Showcase data seeded successfully!');
        $this->command->info('📧 Admin: admin@showcase.test / Password123!');
        $this->command->info('📧 User: john.doe@showcase.test / Password123!');
    }

    /**
     * Create admin and regular users
     */
    private function seedUsers(): array
    {
        $this->command->info('👤 Seeding users...');

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@showcase.test',
            'password' => Hash::make('Password123!'),
            'email_verified_at' => now(),
            'date_of_birth' => '1990-01-01',
            'avatar' => null,
        ]);

        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@showcase.test',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'date_of_birth' => '1995-05-15',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@showcase.test',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'date_of_birth' => '1988-08-22',
            ],
            [
                'name' => 'Michael Johnson',
                'email' => 'michael.johnson@showcase.test',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'date_of_birth' => '1992-03-10',
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@showcase.test',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'date_of_birth' => '1997-11-30',
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david.wilson@showcase.test',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'date_of_birth' => '1985-07-18',
            ],
        ];

        $regularUsers = [];
        foreach ($users as $userData) {
            $regularUsers[] = User::create($userData);
        }

        return array_merge([$admin], $regularUsers);
    }

    /**
     * Create hierarchical categories
     */
    private function seedCategories(): array
    {
        $this->command->info('📁 Seeding categories...');

        // Root categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic devices, gadgets, and accessories',
            'is_active' => true,
            'meta_title' => 'Electronics - Shop Latest Gadgets',
            'meta_description' => 'Browse our wide selection of electronic devices',
        ]);

        $clothing = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'description' => 'Fashion and apparel for everyone',
            'is_active' => true,
            'meta_title' => 'Clothing - Fashion Apparel',
            'meta_description' => 'Discover the latest fashion trends',
        ]);

        $books = Category::create([
            'name' => 'Books',
            'slug' => 'books',
            'description' => 'Books, eBooks, and audiobooks',
            'is_active' => true,
            'meta_title' => 'Books - Read Something New',
            'meta_description' => 'Explore our vast collection of books',
        ]);

        $home = Category::create([
            'name' => 'Home & Garden',
            'slug' => 'home-garden',
            'description' => 'Everything for your home and garden',
            'is_active' => true,
            'meta_title' => 'Home & Garden Essentials',
            'meta_description' => 'Transform your living space',
        ]);

        // Electronics subcategories
        $laptops = Category::create([
            'name' => 'Laptops',
            'slug' => 'laptops',
            'description' => 'Laptops and notebooks',
            'parent_id' => $electronics->id,
            'is_active' => true,
        ]);

        $smartphones = Category::create([
            'name' => 'Smartphones',
            'slug' => 'smartphones',
            'description' => 'Latest smartphones and mobile devices',
            'parent_id' => $electronics->id,
            'is_active' => true,
        ]);

        $accessories = Category::create([
            'name' => 'Accessories',
            'slug' => 'accessories',
            'description' => 'Electronic accessories and peripherals',
            'parent_id' => $electronics->id,
            'is_active' => true,
        ]);

        // Clothing subcategories
        $menClothing = Category::create([
            'name' => 'Men\'s Clothing',
            'slug' => 'mens-clothing',
            'description' => 'Fashion for men',
            'parent_id' => $clothing->id,
            'is_active' => true,
        ]);

        $womenClothing = Category::create([
            'name' => 'Women\'s Clothing',
            'slug' => 'womens-clothing',
            'description' => 'Fashion for women',
            'parent_id' => $clothing->id,
            'is_active' => true,
        ]);

        // Inactive category for testing
        $inactive = Category::create([
            'name' => 'Inactive Category',
            'slug' => 'inactive-category',
            'description' => 'This category is inactive',
            'is_active' => false,
        ]);

        return [
            $electronics, $clothing, $books, $home,
            $laptops, $smartphones, $accessories,
            $menClothing, $womenClothing, $inactive
        ];
    }

    /**
     * Create products with varied attributes
     */
    private function seedProducts(array $categories): array
    {
        $this->command->info('📦 Seeding products...');

        $products = [];

        // Laptops
        $laptopCategory = collect($categories)->first(fn($c) => $c->slug === 'laptops');

        $products[] = $this->createProduct([
            'name' => 'MacBook Pro 16"',
            'slug' => 'macbook-pro-16',
            'description' => 'Powerful laptop with M3 Pro chip, 16GB RAM, 512GB SSD. Perfect for professionals and creators.',
            'short_description' => 'Professional laptop with M3 Pro chip',
            'sku' => 'LAPTOP-001',
            'price' => 2499.99,
            'compare_price' => 2799.99,
            'quantity' => 15,
            'is_featured' => true,
        ], [$laptopCategory]);

        $products[] = $this->createProduct([
            'name' => 'Dell XPS 15',
            'slug' => 'dell-xps-15',
            'description' => 'Premium laptop with Intel i7, 16GB RAM, 1TB SSD, stunning OLED display.',
            'short_description' => 'Premium laptop with OLED display',
            'sku' => 'LAPTOP-002',
            'price' => 1899.99,
            'quantity' => 20,
            'is_featured' => true,
        ], [$laptopCategory]);

        $products[] = $this->createProduct([
            'name' => 'Lenovo ThinkPad X1',
            'slug' => 'lenovo-thinkpad-x1',
            'description' => 'Business laptop with excellent keyboard, 16GB RAM, 512GB SSD.',
            'short_description' => 'Reliable business laptop',
            'sku' => 'LAPTOP-003',
            'price' => 1599.99,
            'compare_price' => 1799.99,
            'quantity' => 12,
        ], [$laptopCategory]);

        // Smartphones
        $smartphoneCategory = collect($categories)->first(fn($c) => $c->slug === 'smartphones');

        $products[] = $this->createProduct([
            'name' => 'iPhone 15 Pro',
            'slug' => 'iphone-15-pro',
            'description' => 'Latest iPhone with A17 Pro chip, titanium design, 256GB storage.',
            'short_description' => 'Latest iPhone with titanium design',
            'sku' => 'PHONE-001',
            'price' => 1199.99,
            'quantity' => 30,
            'is_featured' => true,
        ], [$smartphoneCategory]);

        $products[] = $this->createProduct([
            'name' => 'Samsung Galaxy S24 Ultra',
            'slug' => 'samsung-galaxy-s24-ultra',
            'description' => 'Flagship Samsung with S Pen, 200MP camera, 512GB storage.',
            'short_description' => 'Flagship Samsung with S Pen',
            'sku' => 'PHONE-002',
            'price' => 1299.99,
            'quantity' => 25,
            'is_featured' => true,
        ], [$smartphoneCategory]);

        $products[] = $this->createProduct([
            'name' => 'Google Pixel 8 Pro',
            'slug' => 'google-pixel-8-pro',
            'description' => 'Google Tensor G3, best-in-class camera, pure Android experience.',
            'short_description' => 'Pure Android flagship',
            'sku' => 'PHONE-003',
            'price' => 999.99,
            'quantity' => 18,
        ], [$smartphoneCategory]);

        // Accessories
        $accessoriesCategory = collect($categories)->first(fn($c) => $c->slug === 'accessories');

        $products[] = $this->createProduct([
            'name' => 'Wireless Mouse',
            'slug' => 'wireless-mouse',
            'description' => 'Ergonomic wireless mouse with 6 programmable buttons.',
            'short_description' => 'Ergonomic wireless mouse',
            'sku' => 'ACC-001',
            'price' => 29.99,
            'compare_price' => 39.99,
            'quantity' => 100,
            'weight' => 0.15,
        ], [$accessoriesCategory]);

        $products[] = $this->createProduct([
            'name' => 'Mechanical Keyboard',
            'slug' => 'mechanical-keyboard',
            'description' => 'RGB mechanical keyboard with Cherry MX switches.',
            'short_description' => 'RGB mechanical keyboard',
            'sku' => 'ACC-002',
            'price' => 89.99,
            'quantity' => 50,
            'weight' => 1.2,
        ], [$accessoriesCategory]);

        $products[] = $this->createProduct([
            'name' => 'USB-C Hub',
            'slug' => 'usb-c-hub',
            'description' => '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader.',
            'short_description' => '7-in-1 USB-C hub',
            'sku' => 'ACC-003',
            'price' => 49.99,
            'quantity' => 75,
            'weight' => 0.2,
        ], [$accessoriesCategory]);

        // Men's Clothing
        $menClothingCategory = collect($categories)->first(fn($c) => $c->slug === 'mens-clothing');

        $products[] = $this->createProduct([
            'name' => 'Men\'s Cotton T-Shirt',
            'slug' => 'mens-cotton-tshirt',
            'description' => '100% cotton t-shirt, available in multiple colors.',
            'short_description' => 'Comfortable cotton t-shirt',
            'sku' => 'MEN-001',
            'price' => 19.99,
            'quantity' => 200,
            'weight' => 0.2,
        ], [$menClothingCategory]);

        $products[] = $this->createProduct([
            'name' => 'Men\'s Denim Jeans',
            'slug' => 'mens-denim-jeans',
            'description' => 'Classic fit denim jeans, durable and stylish.',
            'short_description' => 'Classic fit denim jeans',
            'sku' => 'MEN-002',
            'price' => 59.99,
            'compare_price' => 79.99,
            'quantity' => 80,
            'weight' => 0.6,
        ], [$menClothingCategory]);

        // Women's Clothing
        $womenClothingCategory = collect($categories)->first(fn($c) => $c->slug === 'womens-clothing');

        $products[] = $this->createProduct([
            'name' => 'Women\'s Summer Dress',
            'slug' => 'womens-summer-dress',
            'description' => 'Floral print summer dress, lightweight and breathable.',
            'short_description' => 'Floral summer dress',
            'sku' => 'WOMEN-001',
            'price' => 49.99,
            'quantity' => 60,
            'weight' => 0.3,
            'is_featured' => true,
        ], [$womenClothingCategory]);

        $products[] = $this->createProduct([
            'name' => 'Women\'s Yoga Pants',
            'slug' => 'womens-yoga-pants',
            'description' => 'High-waisted yoga pants with moisture-wicking fabric.',
            'short_description' => 'High-waisted yoga pants',
            'sku' => 'WOMEN-002',
            'price' => 39.99,
            'quantity' => 120,
            'weight' => 0.25,
        ], [$womenClothingCategory]);

        // Books
        $booksCategory = collect($categories)->first(fn($c) => $c->slug === 'books');

        $products[] = $this->createProduct([
            'name' => 'The Art of Programming',
            'slug' => 'art-of-programming',
            'description' => 'Comprehensive guide to software development best practices.',
            'short_description' => 'Software development guide',
            'sku' => 'BOOK-001',
            'price' => 39.99,
            'quantity' => 50,
            'weight' => 0.8,
        ], [$booksCategory]);

        $products[] = $this->createProduct([
            'name' => 'Modern Web Design',
            'slug' => 'modern-web-design',
            'description' => 'Learn modern web design principles and techniques.',
            'short_description' => 'Web design principles',
            'sku' => 'BOOK-002',
            'price' => 34.99,
            'quantity' => 40,
            'weight' => 0.7,
        ], [$booksCategory]);

        // Home & Garden
        $homeCategory = collect($categories)->first(fn($c) => $c->slug === 'home-garden');

        $products[] = $this->createProduct([
            'name' => 'Coffee Maker',
            'slug' => 'coffee-maker',
            'description' => 'Programmable coffee maker with 12-cup capacity.',
            'short_description' => '12-cup programmable coffee maker',
            'sku' => 'HOME-001',
            'price' => 79.99,
            'compare_price' => 99.99,
            'quantity' => 35,
            'weight' => 3.5,
        ], [$homeCategory]);

        $products[] = $this->createProduct([
            'name' => 'Plant Pot Set',
            'slug' => 'plant-pot-set',
            'description' => 'Set of 3 ceramic plant pots with drainage holes.',
            'short_description' => 'Ceramic plant pot set',
            'sku' => 'HOME-002',
            'price' => 24.99,
            'quantity' => 90,
            'weight' => 2.0,
        ], [$homeCategory]);

        // Out of stock product
        $products[] = $this->createProduct([
            'name' => 'Limited Edition Watch',
            'slug' => 'limited-edition-watch',
            'description' => 'Exclusive limited edition smartwatch - sold out!',
            'short_description' => 'Limited edition smartwatch',
            'sku' => 'WATCH-001',
            'price' => 399.99,
            'compare_price' => 499.99,
            'quantity' => 0, // Out of stock
        ], [$accessoriesCategory]);

        // Inactive product
        $products[] = $this->createProduct([
            'name' => 'Discontinued Item',
            'slug' => 'discontinued-item',
            'description' => 'This product has been discontinued.',
            'short_description' => 'Discontinued product',
            'sku' => 'DISC-001',
            'price' => 9.99,
            'quantity' => 5,
            'is_active' => false,
        ], [$accessoriesCategory]);

        // Add more varied products to reach 50 (19 explicit + 31 more = 50 total)
        for ($i = 20; $i <= 50; $i++) {
            $randomCategory = $categories[array_rand($categories)];
            $products[] = $this->createProduct([
                'name' => "Sample Product #{$i}",
                'slug' => "sample-product-{$i}",
                'description' => "This is a sample product for testing purposes. Product number {$i}.",
                'short_description' => "Sample product {$i}",
                'sku' => "SAMPLE-" . str_pad($i, 3, '0', STR_PAD_LEFT),
                'price' => rand(10, 500) + (rand(0, 99) / 100),
                'quantity' => rand(0, 100),
                'weight' => rand(1, 50) / 10,
                'is_active' => rand(0, 10) > 1, // 90% active
                'is_featured' => rand(0, 10) > 7, // 30% featured
            ], [$randomCategory]);
        }

        return $products;
    }

    /**
     * Helper to create product with categories
     */
    private function createProduct(array $data, array $categories): Product
    {
        $product = Product::create($data);
        $product->categories()->attach(collect($categories)->pluck('id'));
        return $product;
    }

    /**
     * Create product images
     */
    private function seedProductImages(array $products): void
    {
        $this->command->info('🖼️  Seeding product images...');

        foreach ($products as $product) {
            // 1-3 images per product
            $imageCount = rand(1, 3);

            for ($i = 0; $i < $imageCount; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => "products/{$product->slug}-" . ($i + 1) . ".jpg",
                    'alt_text' => $product->name . " - Image " . ($i + 1),
                    'sort_order' => $i, // Set sort order to avoid unique constraint violation
                    'is_primary' => $i === 0, // First image is primary
                ]);
            }
        }
    }

    /**
     * Create user addresses
     */
    private function seedAddresses(array $users): void
    {
        $this->command->info('📍 Seeding addresses...');

        // Skip admin (index 0), create addresses for regular users
        foreach (array_slice($users, 1) as $index => $user) {
            // Create shipping address
            Address::create([
                'user_id' => $user->id,
                'type' => 'shipping',
                'first_name' => explode(' ', $user->name)[0],
                'last_name' => explode(' ', $user->name)[1] ?? 'User',
                'address_line_1' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10001',
                'country' => 'US',
                'is_default' => true,
            ]);

            // Create billing address
            Address::create([
                'user_id' => $user->id,
                'type' => 'billing',
                'first_name' => explode(' ', $user->name)[0],
                'last_name' => explode(' ', $user->name)[1] ?? 'User',
                'address_line_1' => '456 Oak Avenue',
                'address_line_2' => 'Apt 4B',
                'city' => 'Brooklyn',
                'state' => 'NY',
                'postal_code' => '11201',
                'country' => 'US',
                'is_default' => false,
            ]);
        }
    }

    /**
     * Create shopping carts with items
     */
    private function seedCarts(array $users, array $products): void
    {
        $this->command->info('🛒 Seeding shopping carts...');

        // Create carts for first 3 regular users (skip admin)
        foreach (array_slice($users, 1, 3) as $user) {
            $cart = Cart::create([
                'user_id' => $user->id,
            ]);

            // Add 2-5 random products to cart
            $itemCount = rand(2, 5);
            $randomProducts = collect($products)
                ->where('quantity', '>', 0)
                ->random(min($itemCount, 10));

            foreach ($randomProducts as $product) {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => rand(1, 3),
                    'price' => $product->price,
                ]);
            }
        }
    }

    /**
     * Create orders with various statuses
     */
    private function seedOrders(array $users, array $products): void
    {
        $this->command->info('📋 Seeding orders...');

        $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        // Create 15 orders across different users
        foreach (array_slice($users, 1, 3) as $userIndex => $user) {
            for ($i = 0; $i < 5; $i++) {
                $status = $statuses[($userIndex * 5 + $i) % count($statuses)];

                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                    'status' => $status,
                    'currency' => 'USD',
                    'subtotal' => 0, // Will calculate
                    'tax_amount' => 0,
                    'shipping_amount' => 15.00,
                    'discount_amount' => 0,
                    'total_amount' => 0, // Will calculate
                    'billing_first_name' => explode(' ', $user->name)[0],
                    'billing_last_name' => explode(' ', $user->name)[1] ?? 'User',
                    'billing_address_line_1' => '123 Billing Street',
                    'billing_city' => 'New York',
                    'billing_state' => 'NY',
                    'billing_postal_code' => '10001',
                    'billing_country' => 'US',
                    'shipping_first_name' => explode(' ', $user->name)[0],
                    'shipping_last_name' => explode(' ', $user->name)[1] ?? 'User',
                    'shipping_address_line_1' => '123 Shipping Street',
                    'shipping_city' => 'New York',
                    'shipping_state' => 'NY',
                    'shipping_postal_code' => '10001',
                    'shipping_country' => 'US',
                    'shipped_at' => in_array($status, ['shipped', 'delivered']) ? now()->subDays(rand(1, 5)) : null,
                    'delivered_at' => $status === 'delivered' ? now()->subDays(rand(1, 3)) : null,
                ]);

                // Add 1-4 order items
                $itemCount = rand(1, 4);
                $randomProducts = collect($products)->random(min($itemCount, 10));
                $subtotal = 0;

                foreach ($randomProducts as $product) {
                    $quantity = rand(1, 3);
                    $price = $product->price;
                    $total = $price * $quantity;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $total,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku,
                    ]);

                    $subtotal += $total;
                }

                // Calculate totals
                $taxAmount = round($subtotal * 0.08, 2); // 8% tax
                $totalAmount = $subtotal + $taxAmount + $order->shipping_amount;

                $order->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                ]);
            }
        }
    }

    /**
     * Create wishlist items
     */
    private function seedWishlists(array $users, array $products): void
    {
        $this->command->info('❤️  Seeding wishlists...');

        // Add favorite products for first 3 regular users
        foreach (array_slice($users, 1, 3) as $user) {
            $favoriteCount = rand(3, 8);
            $favoriteProducts = collect($products)->random(min($favoriteCount, 20));

            foreach ($favoriteProducts as $product) {
                DB::table('wishlists')->insert([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

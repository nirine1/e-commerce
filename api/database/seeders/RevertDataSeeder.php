<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RevertDataSeeder extends Seeder
{
    /**
     * Revert (delete) all showcase data from the database.
     *
     * This seeder safely removes all test data created by ShowcaseDataSeeder.
     * It identifies showcase data by:
     * - Users with @showcase.test email domain
     * - Products with SKU starting with specific prefixes
     * - Categories created by showcase seeder
     *
     * Uses database transactions for safety.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->command->info('🧹 Starting showcase data cleanup...');

            // 1. Get showcase users (must be first to track IDs)
            $showcaseUsers = $this->getShowcaseUsers();

            if ($showcaseUsers->isEmpty()) {
                $this->command->info('ℹ️  No showcase data found to revert.');

                return;
            }

            $userIds = $showcaseUsers->pluck('id')->toArray();

            // 2. Delete wishlists (pivot table)
            $this->deleteWishlists($userIds);

            // 3. Delete orders and order items
            $this->deleteOrders($userIds);

            // 4. Delete carts and cart items
            $this->deleteCarts($userIds);

            // 5. Delete addresses
            $this->deleteAddresses($userIds);

            // 6. Delete products and related data
            $this->deleteProducts();

            // 7. Delete categories
            $this->deleteCategories();

            // 8. Delete showcase users (last, after all related data)
            $this->deleteUsers($showcaseUsers);

            $this->command->info('✅ Showcase data successfully reverted!');
        });
    }

    /**
     * Get all showcase users (identified by @showcase.test email)
     */
    private function getShowcaseUsers()
    {
        return User::where('email', 'like', '%@showcase.test')->get();
    }

    /**
     * Delete wishlist entries for showcase users
     */
    private function deleteWishlists(array $userIds): void
    {
        $deleted = DB::table('wishlists')
            ->whereIn('user_id', $userIds)
            ->delete();

        $this->command->info("❤️  Deleted {$deleted} wishlist entries");
    }

    /**
     * Delete orders and order items for showcase users
     */
    private function deleteOrders(array $userIds): void
    {
        $orders = Order::whereIn('user_id', $userIds)->get();
        $orderCount = $orders->count();

        if ($orderCount === 0) {
            $this->command->info('📋 No orders to delete');

            return;
        }

        $orderIds = $orders->pluck('id')->toArray();

        // Delete order items first
        $itemsDeleted = OrderItem::whereIn('order_id', $orderIds)->delete();

        // Delete orders
        Order::whereIn('id', $orderIds)->delete();

        $this->command->info("📋 Deleted {$orderCount} orders and {$itemsDeleted} order items");
    }

    /**
     * Delete carts and cart items for showcase users
     */
    private function deleteCarts(array $userIds): void
    {
        $carts = Cart::whereIn('user_id', $userIds)->get();
        $cartCount = $carts->count();

        if ($cartCount === 0) {
            $this->command->info('🛒 No carts to delete');

            return;
        }

        $cartIds = $carts->pluck('id')->toArray();

        // Delete cart items first
        $itemsDeleted = CartItem::whereIn('cart_id', $cartIds)->delete();

        // Delete carts
        Cart::whereIn('id', $cartIds)->delete();

        $this->command->info("🛒 Deleted {$cartCount} carts and {$itemsDeleted} cart items");
    }

    /**
     * Delete addresses for showcase users
     */
    private function deleteAddresses(array $userIds): void
    {
        $deleted = Address::whereIn('user_id', $userIds)->delete();

        $this->command->info("📍 Deleted {$deleted} addresses");
    }

    /**
     * Delete showcase products and related data
     */
    private function deleteProducts(): void
    {
        // Identify showcase products by SKU prefixes
        $skuPrefixes = [
            'LAPTOP-%',
            'PHONE-%',
            'ACC-%',
            'MEN-%',
            'WOMEN-%',
            'BOOK-%',
            'HOME-%',
            'WATCH-%',
            'DISC-%',
            'SAMPLE-%',
        ];

        $products = Product::where(function ($query) use ($skuPrefixes) {
            foreach ($skuPrefixes as $prefix) {
                $query->orWhere('sku', 'like', $prefix);
            }
        })->get();

        $productCount = $products->count();

        if ($productCount === 0) {
            $this->command->info('📦 No products to delete');

            return;
        }

        $productIds = $products->pluck('id')->toArray();

        // Delete product images
        $imagesDeleted = ProductImage::whereIn('product_id', $productIds)->delete();

        // Delete category_product pivot entries
        DB::table('category_product')->whereIn('product_id', $productIds)->delete();

        // Delete products
        Product::whereIn('id', $productIds)->delete();

        $this->command->info("📦 Deleted {$productCount} products and {$imagesDeleted} images");
    }

    /**
     * Delete showcase categories
     */
    private function deleteCategories(): void
    {
        // Identify showcase categories by slug
        $categorySlugs = [
            'electronics',
            'clothing',
            'books',
            'home-garden',
            'laptops',
            'smartphones',
            'accessories',
            'mens-clothing',
            'womens-clothing',
            'inactive-category',
        ];

        // Delete child categories first (to avoid foreign key issues)
        $childCategoriesDeleted = Category::whereIn('slug', $categorySlugs)
            ->whereNotNull('parent_id')
            ->delete();

        // Then delete parent categories
        $parentCategoriesDeleted = Category::whereIn('slug', $categorySlugs)
            ->whereNull('parent_id')
            ->delete();

        $totalDeleted = $childCategoriesDeleted + $parentCategoriesDeleted;

        $this->command->info("📁 Deleted {$totalDeleted} categories");
    }

    /**
     * Delete showcase users (must be last)
     */
    private function deleteUsers($showcaseUsers): void
    {
        $userCount = $showcaseUsers->count();

        foreach ($showcaseUsers as $user) {
            $user->delete();
        }

        $this->command->info("👤 Deleted {$userCount} showcase users");
    }

    /**
     * Get statistics about showcase data (useful for verification)
     */
    public function getStatistics(): array
    {
        $showcaseUsers = $this->getShowcaseUsers();
        $userIds = $showcaseUsers->pluck('id')->toArray();

        if (empty($userIds)) {
            return [
                'users' => 0,
                'addresses' => 0,
                'carts' => 0,
                'orders' => 0,
                'products' => 0,
                'categories' => 0,
                'wishlists' => 0,
            ];
        }

        $skuPrefixes = ['LAPTOP-%', 'PHONE-%', 'ACC-%', 'MEN-%', 'WOMEN-%', 'BOOK-%', 'HOME-%', 'WATCH-%', 'DISC-%', 'SAMPLE-%'];
        $categorySlugs = ['electronics', 'clothing', 'books', 'home-garden', 'laptops', 'smartphones', 'accessories', 'mens-clothing', 'womens-clothing', 'inactive-category'];

        return [
            'users' => $showcaseUsers->count(),
            'addresses' => Address::whereIn('user_id', $userIds)->count(),
            'carts' => Cart::whereIn('user_id', $userIds)->count(),
            'orders' => Order::whereIn('user_id', $userIds)->count(),
            'products' => Product::where(function ($query) use ($skuPrefixes) {
                foreach ($skuPrefixes as $prefix) {
                    $query->orWhere('sku', 'like', $prefix);
                }
            })->count(),
            'categories' => Category::whereIn('slug', $categorySlugs)->count(),
            'wishlists' => DB::table('wishlists')->whereIn('user_id', $userIds)->count(),
        ];
    }
}

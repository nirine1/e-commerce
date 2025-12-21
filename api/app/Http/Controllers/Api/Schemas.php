<?php

namespace App\Http\Controllers\Api;

/**
 * @OA\Schema(
 *     schema="Product",
 *     title="Product",
 *     description="Product model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="MacBook Pro 16 inch"),
 *     @OA\Property(property="slug", type="string", example="macbook-pro-16"),
 *     @OA\Property(property="description", type="string", example="Powerful laptop with M3 Pro chip"),
 *     @OA\Property(property="short_description", type="string", example="Professional laptop with M3 Pro chip"),
 *     @OA\Property(property="sku", type="string", example="LAPTOP-001"),
 *     @OA\Property(property="price", type="number", format="float", example=2499.99),
 *     @OA\Property(property="compare_price", type="number", format="float", nullable=true, example=2799.99),
 *     @OA\Property(property="quantity", type="integer", example=15),
 *     @OA\Property(property="min_quantity", type="integer", nullable=true, example=1),
 *     @OA\Property(property="weight", type="number", format="float", nullable=true, example=2.5),
 *     @OA\Property(
 *         property="dimensions",
 *         type="object",
 *         @OA\Property(property="length", type="number", format="float", example=35.5),
 *         @OA\Property(property="width", type="number", format="float", example=24.0),
 *         @OA\Property(property="height", type="number", format="float", example=2.0)
 *     ),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="is_featured", type="boolean", example=true),
 *     @OA\Property(property="in_stock", type="boolean", example=true),
 *     @OA\Property(
 *         property="meta",
 *         type="object",
 *         @OA\Property(property="title", type="string", example="MacBook Pro 16 - High Performance"),
 *         @OA\Property(property="description", type="string", example="Best laptop 2025")
 *     ),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-15T10:30:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-10-20T14:45:00.000000Z"),
 *     @OA\Property(
 *         property="categories",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CategorySimple")
 *     ),
 *     @OA\Property(
 *         property="images",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/ProductImage")
 *     )
 * )
 *
 *
 * @OA\Schema(
 *     schema="CartItem",
 *     title="Cart Item",
 *     description="Cart item model",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *
 *     @OA\Property(property="cart_id", type="integer", example=5),
 *     @OA\Property(property="product_id", type="integer", example=12),
 *
 *     @OA\Property(property="quantity", type="integer", example=3),
 *
 *     @OA\Property(property="price", type="number", format="float", example=19.99),
 *
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-11-21T10:30:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-11-21T11:00:00.000000Z"),
 *
 *     @OA\Property(
 *         property="product",
 *         description="Associated product",
 *         ref="#/components/schemas/Product"
 *     )
 * )
 * @OA\Schema(
 *     schema="Category",
 *     title="Category",
 *     description="Category model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Electronics"),
 *     @OA\Property(property="slug", type="string", example="electronics"),
 *     @OA\Property(property="description", type="string", nullable=true, example="Electronic devices and accessories"),
 *     @OA\Property(property="image", type="string", nullable=true, example="categories/electronics.jpg"),
 *     @OA\Property(property="parent_id", type="integer", nullable=true, example=null),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(
 *         property="meta",
 *         type="object",
 *         @OA\Property(property="title", type="string", example="Electronics Category"),
 *         @OA\Property(property="description", type="string", example="Browse all electronics")
 *     ),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-01T09:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-10-15T11:30:00.000000Z"),
 *     @OA\Property(property="products_count", type="integer", example=45),
 *     @OA\Property(property="parent", ref="#/components/schemas/CategorySimple", nullable=true),
 *     @OA\Property(
 *         property="children",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CategorySimple")
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="CategorySimple",
 *     title="Category Simple",
 *     description="Simplified category model for relationships",
 *     @OA\Property(property="id", type="integer", example=2),
 *     @OA\Property(property="name", type="string", example="Laptops"),
 *     @OA\Property(property="slug", type="string", example="laptops"),
 *     @OA\Property(property="parent_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="products_count", type="integer", example=12)
 * )
 *
 * @OA\Schema(
 *     schema="ProductImage",
 *     title="Product Image",
 *     description="Product image model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="image_path", type="string", example="products/laptop-001.jpg"),
 *     @OA\Property(property="image_url", type="string", example="http://localhost:8080/storage/products/laptop-001.jpg"),
 *     @OA\Property(property="alt_text", type="string", nullable=true, example="MacBook Pro front view"),
 *     @OA\Property(property="is_primary", type="boolean", example=true)
 * )
 *
 * @OA\Schema(
 *     schema="ValidationError",
 *     title="Validation Error",
 *     description="Validation error response",
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         @OA\Property(
 *             property="sku",
 *             type="array",
 *             @OA\Items(type="string", example="The sku has already been taken.")
 *         ),
 *         @OA\Property(
 *             property="price",
 *             type="array",
 *             @OA\Items(type="string", example="The price must be at least 0.")
 *         )
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     title="Error Response",
 *     description="Generic error response",
 *     @OA\Property(property="message", type="string", example="An error occurred")
 * )
 */
class Schemas
{
    // This class exists only to hold OpenAPI schema definitions
}

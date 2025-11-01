<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="E-Commerce API Documentation",
 *     description="RESTful API for e-commerce platform with Products, Categories, Cart, Orders, and more",
 *     @OA\Contact(
 *         email="support@example.com"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8080/api",
 *     description="Local Development Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Sanctum",
 *     description="Laravel Sanctum Bearer Token Authentication"
 * )
 *
 * @OA\Tag(
 *     name="Products",
 *     description="Product catalog endpoints - browse, search, and manage products"
 * )
 *
 * @OA\Tag(
 *     name="Categories",
 *     description="Product categories endpoints - hierarchical category management"
 * )
 */
class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/products",
     *     operationId="get-products",
     *     tags={"Products"},
     *     summary="List all products",
     *     description="Get paginated list of products with optional filtering, searching, and sorting",
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search in product name, description, or SKU",
     *         required=false,
     *         @OA\Schema(type="string", example="laptop")
     *     ),
     *     @OA\Parameter(
     *         name="category",
     *         in="query",
     *         description="Filter by category ID or slug",
     *         required=false,
     *         @OA\Schema(type="string", example="electronics")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="is_featured",
     *         in="query",
     *         description="Filter featured products",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="in_stock",
     *         in="query",
     *         description="Filter products in stock",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="min_price",
     *         in="query",
     *         description="Minimum price filter",
     *         required=false,
     *         @OA\Schema(type="number", format="float", example=100.00)
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         description="Maximum price filter",
     *         required=false,
     *         @OA\Schema(type="number", format="float", example=1000.00)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort field (name, price, quantity, created_at, updated_at)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"name", "price", "quantity", "created_at", "updated_at"}, example="price")
     *     ),
     *     @OA\Parameter(
     *         name="sort_direction",
     *         in="query",
     *         description="Sort direction",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc", "desc"}, example="asc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page (default: 15)",
     *         required=false,
     *         @OA\Schema(type="integer", example=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Product")),
     *             @OA\Property(property="links", type="object",
     *                 @OA\Property(property="first", type="string", example="http://localhost:8080/api/products?page=1"),
     *                 @OA\Property(property="last", type="string", example="http://localhost:8080/api/products?page=5"),
     *                 @OA\Property(property="prev", type="string", nullable=true),
     *                 @OA\Property(property="next", type="string", example="http://localhost:8080/api/products?page=2")
     *             ),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="from", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=15),
     *                 @OA\Property(property="to", type="integer", example=15),
     *                 @OA\Property(property="total", type="integer", example=73)
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Product::with(['categories', 'images']);

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category)
                  ->orWhere('id', $request->category);
            });
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by featured
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // In stock filter
        if ($request->has('in_stock')) {
            if ($request->boolean('in_stock')) {
                $query->where('quantity', '>', 0);
            } else {
                $query->where('quantity', '<=', 0);
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['name', 'price', 'quantity', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * @OA\Post(
     *     path="/products",
     *     operationId="create-product",
     *     tags={"Products"},
     *     summary="Create a new product",
     *     description="Create a new product (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "sku", "price", "quantity"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Wireless Mouse"),
     *             @OA\Property(property="description", type="string", example="Ergonomic wireless mouse with 6 programmable buttons"),
     *             @OA\Property(property="short_description", type="string", maxLength=500, example="Comfortable wireless mouse"),
     *             @OA\Property(property="sku", type="string", example="MOUSE-001"),
     *             @OA\Property(property="price", type="number", format="float", example=29.99),
     *             @OA\Property(property="compare_price", type="number", format="float", nullable=true, example=39.99),
     *             @OA\Property(property="quantity", type="integer", example=100),
     *             @OA\Property(property="min_quantity", type="integer", nullable=true, example=1),
     *             @OA\Property(property="weight", type="number", format="float", nullable=true, example=0.15),
     *             @OA\Property(property="dimensions_length", type="number", format="float", nullable=true, example=12.0),
     *             @OA\Property(property="dimensions_width", type="number", format="float", nullable=true, example=7.0),
     *             @OA\Property(property="dimensions_height", type="number", format="float", nullable=true, example=4.0),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="is_featured", type="boolean", example=false),
     *             @OA\Property(property="meta_title", type="string", maxLength=255, nullable=true, example="Wireless Mouse - Ergonomic Design"),
     *             @OA\Property(property="meta_description", type="string", maxLength=500, nullable=true, example="Best wireless mouse for productivity"),
     *             @OA\Property(property="category_ids", type="array", @OA\Items(type="integer"), example={2, 5})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Product")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => 'required|string|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions_length' => 'nullable|numeric|min:0',
            'dimensions_width' => 'nullable|numeric|min:0',
            'dimensions_height' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Create product
        $product = Product::create($validated);

        // Attach categories if provided
        if (isset($validated['category_ids'])) {
            $product->categories()->sync($validated['category_ids']);
        }

        // Load relationships
        $product->load(['categories', 'images']);

        return new ProductResource($product);
    }

    /**
     * @OA\Get(
     *     path="/products/{id}",
     *     operationId="get-product-by-id",
     *     tags={"Products"},
     *     summary="Get a single product",
     *     description="Get detailed information about a specific product",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Product")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found")
     * )
     */
    public function show(Product $product)
    {
        $product->load(['categories', 'images']);

        return new ProductResource($product);
    }

    /**
     * @OA\Put(
     *     path="/products/{id}",
     *     operationId="update-product",
     *     tags={"Products"},
     *     summary="Update a product",
     *     description="Update an existing product (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", maxLength=255, example="Updated Product Name"),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="price", type="number", format="float", example=24.99),
     *             @OA\Property(property="quantity", type="integer", example=150),
     *             @OA\Property(property="is_featured", type="boolean", example=true),
     *             @OA\Property(property="category_ids", type="array", @OA\Items(type="integer"), example={2, 5})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Product")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Patch(
     *     path="/products/{id}",
     *     operationId="patch-product",
     *     tags={"Products"},
     *     summary="Partially update a product",
     *     description="Partially update an existing product (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="price", type="number", format="float", example=24.99),
     *             @OA\Property(property="quantity", type="integer", example=150)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Product")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => ['sometimes', 'string', Rule::unique('products', 'sku')->ignore($product->id)],
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'quantity' => 'sometimes|integer|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions_length' => 'nullable|numeric|min:0',
            'dimensions_width' => 'nullable|numeric|min:0',
            'dimensions_height' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        // Update slug if name changed
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Update product
        $product->update($validated);

        // Update categories if provided
        if (isset($validated['category_ids'])) {
            $product->categories()->sync($validated['category_ids']);
        }

        // Reload relationships
        $product->load(['categories', 'images']);

        return new ProductResource($product);
    }

    /**
     * @OA\Delete(
     *     path="/products/{id}",
     *     operationId="delete-product",
     *     tags={"Products"},
     *     summary="Delete a product",
     *     description="Delete an existing product (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Product deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Product not found")
     * )
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ], 200);
    }
}

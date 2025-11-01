<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Supports:
     * - Pagination (per_page)
     * - Search (search query)
     * - Filtering (category, is_active, is_featured, min_price, max_price)
     * - Sorting (sort_by, sort_direction)
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
     * Store a newly created resource in storage.
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
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['categories', 'images']);

        return new ProductResource($product);
    }

    /**
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ], 200);
    }
}

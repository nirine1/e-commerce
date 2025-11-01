<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * @OA\Get(
     *     path="/categories",
     *     operationId="get-categories",
     *     tags={"Categories"},
     *     summary="List all categories",
     *     description="Get list of categories with optional filtering and hierarchical loading",
     *     @OA\Parameter(
     *         name="parent_id",
     *         in="query",
     *         description="Filter by parent ID (use 'null' for root categories)",
     *         required=false,
     *         @OA\Schema(type="string", example="null")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="with_children",
     *         in="query",
     *         description="Include child categories",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="with_parent",
     *         in="query",
     *         description="Include parent category",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="with_counts",
     *         in="query",
     *         description="Include product counts",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="all",
     *         in="query",
     *         description="Return all categories (no pagination)",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort field (name, created_at, updated_at)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"name", "created_at", "updated_at"}, example="name")
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
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Category"))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Load children if requested
        if ($request->boolean('with_children')) {
            $query->with('children');
        }

        // Load parent if requested
        if ($request->boolean('with_parent')) {
            $query->with('parent');
        }

        // Filter by parent (root categories if parent_id=null)
        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null' || $request->parent_id === '') {
                $query->whereNull('categories.parent_id');
            } else {
                $query->where('categories.parent_id', $request->parent_id);
            }
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('categories.is_active', $request->boolean('is_active'));
        }

        // Include product counts
        if ($request->boolean('with_counts')) {
            $query->withCount('products');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSorts = ['name', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Return all categories or paginate
        if ($request->boolean('all')) {
            $categories = $query->get();
            return CategoryResource::collection($categories);
        }

        $perPage = $request->get('per_page', 15);
        $categories = $query->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    /**
     * @OA\Post(
     *     path="/categories",
     *     operationId="create-category",
     *     tags={"Categories"},
     *     summary="Create a new category",
     *     description="Create a new category (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Electronics"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Electronic devices and accessories"),
     *             @OA\Property(property="image", type="string", nullable=true, example="categories/electronics.jpg"),
     *             @OA\Property(property="parent_id", type="integer", nullable=true, example=null),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="meta_title", type="string", maxLength=255, nullable=true, example="Electronics Category"),
     *             @OA\Property(property="meta_description", type="string", maxLength=500, nullable=true, example="Browse all electronics")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Category created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Category")
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
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Create category
        $category = Category::create($validated);

        // Load relationships if needed
        $category->load(['parent', 'children']);

        return new CategoryResource($category);
    }

    /**
     * @OA\Get(
     *     path="/categories/{id_or_slug}",
     *     operationId="get-category-by-id-or-slug",
     *     tags={"Categories"},
     *     summary="Get a single category",
     *     description="Get detailed information about a specific category by ID or slug",
     *     @OA\Parameter(
     *         name="id_or_slug",
     *         in="path",
     *         description="Category ID or slug (e.g., '1' or 'electronics')",
     *         required=true,
     *         @OA\Schema(type="string", example="electronics")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Category")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Category not found")
     * )
     */
    public function show(Category $category)
    {
        $category->load(['parent', 'children']);

        // Load product count if requested
        $category->loadCount('products');

        return new CategoryResource($category);
    }

    /**
     * @OA\Put(
     *     path="/categories/{id_or_slug}",
     *     operationId="update-category",
     *     tags={"Categories"},
     *     summary="Update a category",
     *     description="Update an existing category by ID or slug (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id_or_slug",
     *         in="path",
     *         description="Category ID or slug (e.g., '1' or 'electronics')",
     *         required=true,
     *         @OA\Schema(type="string", example="electronics")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", maxLength=255, example="Updated Category Name"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Updated description"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Category updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Category")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Category not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Patch(
     *     path="/categories/{id_or_slug}",
     *     operationId="patch-category",
     *     tags={"Categories"},
     *     summary="Partially update a category",
     *     description="Partially update an existing category by ID or slug (requires authentication)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id_or_slug",
     *         in="path",
     *         description="Category ID or slug (e.g., '1' or 'electronics')",
     *         required=true,
     *         @OA\Schema(type="string", example="electronics")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", maxLength=255, example="Updated Name"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Category updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Category")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Category not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                // Prevent category from being its own parent
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->id) {
                        $fail('A category cannot be its own parent.');
                    }
                },
            ],
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Update slug if name changed
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Update category
        $category->update($validated);

        // Reload relationships
        $category->load(['parent', 'children']);

        return new CategoryResource($category);
    }

    /**
     * @OA\Delete(
     *     path="/categories/{id_or_slug}",
     *     operationId="delete-category",
     *     tags={"Categories"},
     *     summary="Delete a category",
     *     description="Delete an existing category by ID or slug (requires authentication). Cannot delete if category has children or products.",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id_or_slug",
     *         in="path",
     *         description="Category ID or slug (e.g., '1' or 'electronics')",
     *         required=true,
     *         @OA\Schema(type="string", example="electronics")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Category deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Category deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Cannot delete category with subcategories or products",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cannot delete category with products. Reassign products first.")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Category not found")
     * )
     */
    public function destroy(Category $category)
    {
        // Check if category has children
        if ($category->children()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with subcategories. Delete or reassign subcategories first.'
            ], 422);
        }

        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with products. Reassign products first.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ], 200);
    }
}

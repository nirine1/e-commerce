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
     * Display a listing of the resource.
     *
     * Supports:
     * - Filtering (parent_id, is_active)
     * - Including product counts
     * - Hierarchical display (with children)
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
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
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
     * Store a newly created resource in storage.
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
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['parent', 'children']);

        // Load product count if requested
        $category->loadCount('products');

        return new CategoryResource($category);
    }

    /**
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
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

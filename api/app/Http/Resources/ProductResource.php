<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'compare_price' => $this->compare_price ? (float) $this->compare_price : null,
            'quantity' => (int) $this->quantity,
            'min_quantity' => (int) $this->min_quantity,
            'weight' => $this->weight ? (float) $this->weight : null,
            'dimensions' => [
                'length' => $this->dimensions_length ? (float) $this->dimensions_length : null,
                'width' => $this->dimensions_width ? (float) $this->dimensions_width : null,
                'height' => $this->dimensions_height ? (float) $this->dimensions_height : null,
            ],
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'in_stock' => $this->quantity > 0,
            'meta' => [
                'title' => $this->meta_title,
                'description' => $this->meta_description,
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships (loaded conditionally)
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'primary_image' => new ProductImageResource($this->whenLoaded('images', function() {
                return $this->images->where('is_primary', true)->first();
            })),
        ];
    }
}

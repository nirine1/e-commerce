<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
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
            'product_id' => $this->product_id,
            'image_path' => $this->image_path,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'alt_text' => $this->alt_text,
            'sort_order' => (int) $this->sort_order,
            'is_primary' => (bool) $this->is_primary,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

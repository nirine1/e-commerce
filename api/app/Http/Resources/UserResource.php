<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'avatar' => $this->avatar,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'email_verified' => $this->email_verified_at !== null,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Conditional relationships
            'addresses' => AddressResource::collection($this->whenLoaded('addresses')),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),
        ];
    }
}

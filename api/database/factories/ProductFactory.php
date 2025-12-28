<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.uniqid(),
            'description' => $this->faker->paragraph(4),
            'short_description' => $this->faker->sentence(),
            'sku' => strtoupper(Str::random(10)),

            'price' => $this->faker->randomFloat(2, 5, 500),
            'compare_price' => $this->faker->optional()->randomFloat(2, 5, 600),
            'cost_price' => $this->faker->randomFloat(2, 2, 300),

            'quantity' => $this->faker->numberBetween(0, 500),
            'min_quantity' => $this->faker->numberBetween(0, 10),

            'weight' => $this->faker->randomFloat(2, 0.1, 10),
            'dimensions_length' => $this->faker->randomFloat(2, 1, 100),
            'dimensions_width' => $this->faker->randomFloat(2, 1, 100),
            'dimensions_height' => $this->faker->randomFloat(2, 1, 100),

            'is_active' => $this->faker->boolean(),
            'is_featured' => $this->faker->boolean(),

            'meta_title' => $this->faker->sentence(3),
            'meta_description' => $this->faker->sentence(10),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * Note: slug is auto-generated from name
     * Note: cost_price is internal data, not mass assignable
     */
    protected $fillable = [
        'name',
        'description',
        'short_description',
        'sku',
        'price',
        'compare_price',
        'quantity',
        'min_quantity',
        'weight',
        'dimensions_length',
        'dimensions_width',
        'dimensions_height',
        'is_active',
        'is_featured',
        'meta_title',
        'meta_description',
    ];

    /**
     * The attributes that should be hidden for serialization.
     * cost_price is internal data not exposed to public
     */
    protected $hidden = [
        'cost_price',
    ];

    protected $with = [
        'images'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'dimensions_length' => 'decimal:2',
        'dimensions_width' => 'decimal:2',
        'dimensions_height' => 'decimal:2',
        'quantity' => 'integer',
        'min_quantity' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    // Relations
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_product')->withTimestamps();
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlistedBy()
    {
        return $this->belongsToMany(User::class, 'wishlists')->withTimestamps();
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (! filled($product->slug)) {
                $index = 0;
                do {
                    $slug = Str::slug($product->name);
                    $slug = $index > 0 ? ($slug.'-'.uniqid()) : $slug;
                    $product->slug = $slug;
                    $index++;
                } while (Product::where('slug', $slug)->exists());
            }
        });
    }

    /**
     * Retrieve the model for a bound value.
     * Supports both ID and slug lookups.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)
            ->orWhere('slug', $value)
            ->firstOrFail();
    }
}

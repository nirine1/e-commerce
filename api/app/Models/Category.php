<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * Note: slug is auto-generated from name
     */
    protected $fillable = [
        'name',
        'description',
        'image',
        'parent_id',
        'is_active',
        'meta_title',
        'meta_description'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_active' => 'boolean',
        'parent_id' => 'integer',
    ];

    // Relations
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'category_product')->withTimestamps();
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Category $category) {
            if(!filled($category->slug)) {
                $index = 0;
                do {
                    $slug = Str::slug($category->name);
                    $slug = $index > 0 ? ($slug  . '-' . uniqid()) : $slug;
                    $category->slug = $slug;
                    $index++;
                } while(Category::where('slug', $slug)->exists());
            }
        });
    }
}

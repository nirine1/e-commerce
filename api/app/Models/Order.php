<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','order_number','status','currency','subtotal','tax_amount',
        'shipping_amount','discount_amount','total_amount','notes',
        'billing_first_name','billing_last_name','billing_company','billing_address_line_1','billing_address_line_2','billing_city','billing_state','billing_postal_code','billing_country',
        'shipping_first_name','shipping_last_name','shipping_company','shipping_address_line_1','shipping_address_line_2','shipping_city','shipping_state','shipping_postal_code','shipping_country',
        'shipped_at','delivered_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}

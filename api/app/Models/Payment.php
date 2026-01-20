<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_session_id',
        'stripe_payment_intent_id',
        'stripe_customer_id',
        'customer_email',
        'amount',
        'currency',
        'status',
        'payment_method',
        'description',
        'metadata',
        'checkout_url',
        'expires_at',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'succeeded' && $this->paid_at !== null;
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function isFailed(): bool
    {
        return in_array($this->status, ['failed', 'canceled', 'expired']);
    }
}
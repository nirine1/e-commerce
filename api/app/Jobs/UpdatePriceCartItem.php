<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\CartItem;

class UpdatePriceCartItem implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        CartItem::chunkById(100, function ($cartItems) {
            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;
                if ($product) {
                    $cartItem->price = $product->price;
                    $cartItem->save();
                }
            }
        });
    }
}

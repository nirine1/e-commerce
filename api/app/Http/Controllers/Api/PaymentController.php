<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\StripeService;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(private StripeService $stripeService)
    {
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'currency' => 'sometimes|string|size:3',
        ]);

        $user = $request->user();
        $amount = $request->input('amount');
        $currency = $request->input('currency', 'usd');

        try {
            $paymentIntentData = $this->stripeService->createPaymentIntent($user, $amount, $currency);

            return response()->json([
                'client_secret' => $paymentIntentData['client_secret'],
                'payment_intent_id' => $paymentIntentData['payment_intent_id'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\StripeService;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="Stripe Payments",
 *     description="Stripe payment endpoints - manage payments"
 * )
 */
class PaymentController extends Controller
{
    public function __construct(private StripeService $stripeService)
    {
    }

    /**
     * @OA\Post(
     *    path="/payments/create-intent",
     *    operationId="create-payment-intent",
     *    tags={"Stripe Payments"},
     *    summary="Create a Stripe Payment Intent",
     *    description="Creates a new Stripe Payment Intent for the authenticated user",
     *    security={{"sanctum": {}}},
     *    @OA\RequestBody(
     *       required=true,
     *       @OA\JsonContent(
     *         required={"amount"},
     *         @OA\Property(
     *           property="amount",
     *           type="integer",
     *           example=5000,
     *           description="Amount to be charged in the smallest currency unit (e.g., cents)"
     *         ),
     *         @OA\Property(
     *           property="currency",
     *           type="string",
     *           example="eur",
     *           description="Currency code (default is 'eur')"
     *         )
     *       )
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="Payment Intent created successfully",
     *       @OA\JsonContent(
     *         @OA\Property(
     *           property="client_secret",
     *           type="string",
     *           example="pi_1FHeJ2L3a2b3c4D5E6F7G8H9I_secret_1234567890abcdef"
     *         ),
     *         @OA\Property(
     *           property="payment_intent_id",
     *           type="string",
     *           example="pi_1FHeJ2L3a2b3c4D5E6F7G8H9I"
     *         )
     *       )
     *    ),
     *    @OA\Response(
     *       response=500,
     *       description="Server error"
     *    )
     * )
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'currency' => 'sometimes|string|size:3',
        ]);

        $user = $request->user();
        $amount = $request->input('amount');
        $currency = $request->input('currency', 'eur');

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

    /**
     * @OA\Post(
     *    path="/payments/confirm-intent/{paymentIntentId}",
     *    operationId="confirm-payment-intent",
     *    tags={"Stripe Payments"},
     *    summary="Confirm a Stripe Payment Intent",
     *    description="Confirms an existing Stripe Payment Intent",
     *    security={{"sanctum": {}}},
     *    @OA\Parameter(
     *       name="paymentIntentId",
     *       in="path",
     *       required=true,
     *       description="The ID of the Payment Intent to confirm",
     *       @OA\Schema(type="string", example="pi_1FHeJ2L3a2b3c4D5E6F7G8H9I")
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="Payment Intent confirmed successfully",
     *       @OA\JsonContent(
     *         @OA\Property(
     *           property="status",
     *           type="string",
     *           example="succeeded"
     *         )
     *       )
     *    ),
     *    @OA\Response(
     *       response=500,
     *       description="Server error"
     *    )
     * )
     */
    public function confirmPaymentIntent(Request $request, $paymentIntentId)
    {
        try {
            $paymentIntent = $this->stripeService->confirmPaymentIntent($paymentIntentId);

            return response()->json([
                'status' => $paymentIntent->status,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
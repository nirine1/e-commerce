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
     *    path="/payments/create-checkout-session",
     *    operationId="create-checkout-session",
     *    tags={"Stripe Payments"},
     *    summary="Create a Stripe Checkout Session",
     *    description="Creates a Stripe Checkout Session and returns the URL to redirect the user",
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
     *         ),
     *         @OA\Property(
     *           property="description",
     *           type="string",
     *           example="Purchase description",
     *           description="Description of the purchase"
     *         )
     *       )
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="Checkout Session created successfully",
     *       @OA\JsonContent(
     *         @OA\Property(
     *           property="checkout_url",
     *           type="string",
     *           example="https://checkout.stripe.com/c/pay/cs_test_..."
     *         ),
     *         @OA\Property(
     *           property="session_id",
     *           type="string",
     *           example="cs_test_1234567890"
     *         )
     *       )
     *    ),
     *    @OA\Response(
     *       response=500,
     *       description="Server error"
     *    )
     * )
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'currency' => 'sometimes|string|size:3',
            'description' => 'sometimes|string|max:255',
        ]);

        $user = $request->user();
        $amount = $request->input('amount');
        $currency = $request->input('currency', 'eur');
        $description = $request->input('description', 'Payment');

        try {
            $sessionData = $this->stripeService->createCheckoutSession(
                $user,
                $amount,
                $currency,
                $description
            );

            return response()->json([
                'checkout_url' => $sessionData['url'], // lien pour rediriger l'utilisateur
                'session_id' => $sessionData['id'],
            ]);            
        } catch (\Exception $e) {
            Log::error('Stripe checkout session error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *    path="/payment/success",
     *    operationId="payment-success",
     *    tags={"Stripe Payments"},
     *    summary="Payment Success",
     *    description="Endpoint called when the payment is successful",
     *    @OA\Response(
     *       response=200,
     *       description="Payment successful",
     *       @OA\JsonContent(
     *         @OA\Property(
     *           property="message",
     *           type="string",
     *           example="Payment successful!"
     *         )
     *       )
     *    )
     * )
     */
    public function paymentSuccess(Request $request)
    {
        return response()->json(['message' => 'Payment successful!']);
    }

    /**
     * @OA\Get(
     *    path="/payment/cancel",
     *    operationId="payment-cancel",
     *    tags={"Stripe Payments"},
     *    summary="Payment Cancel",
     *    description="Endpoint called when the payment is canceled",
     *    @OA\Response(
     *       response=200,
     *       description="Payment canceled",
     *       @OA\JsonContent(
     *         @OA\Property(
     *           property="message",
     *           type="string",
     *           example="Payment canceled!"
     *         )
     *       )
     *    )
     * )
     */
    public function paymentCancel(Request $request)
    {
        return response()->json(['message' => 'Payment canceled!']);
    }
}
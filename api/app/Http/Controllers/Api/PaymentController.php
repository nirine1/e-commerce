<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\StripeService;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

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
     *     path="/payments/checkout",
     *     operationId="create-order-and-checkout",
     *     tags={"Stripe Payments"},
     *     summary="Create Order and Stripe Checkout Session",
     *     description="Create an order and initiate a Stripe Checkout session",
     *     security={{"sanctum": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="order_id", type="integer", example=123),
     *             @OA\Property(property="success_url", type="string", example="https://frontend.com/payment/success"),
     *             @OA\Property(property="cancel_url", type="string", example="https://frontend.com/payment/cancel")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Checkout session created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="order_id", type="integer", example=123),
     *             @OA\Property(property="checkout_url", type="string", example="https://checkout.stripe.com/pay/cs_test_1234567890"),
     *             @OA\Property(property="session_id", type="string", example="cs_test_1234567890")
     *         )
     *     ),
     *
     *     @OA\Response(response=400, description="Bad request"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */

    public function createOrderAndCheckout(Request $request)
    {
        try {
            // Validation des données
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'success_url' => 'required|url',
                'cancel_url' => 'required|url',
            ]);

            $user = $request->user();
            
            // Récupérer la commande existante
            $order = Order::findOrFail($validated['order_id']);

            // Vérifier que la commande appartient bien à l'utilisateur
            if ($order->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à accéder à cette commande',
                ], 403);
            }

            // Vérifier qu'il n'y a pas déjà un paiement réussi pour cette commande
            $existingPayment = Payment::where('order_id', $order->id)
                ->where('status', 'success')
                ->first();
                
            if ($existingPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette commande a déjà été payée',
                ], 400);
            }

            // Créer la session Stripe Checkout avec les URLs du frontend
            $session = $this->stripeService->createCheckoutSession(
                $order->total_amount,
                $user,
                $validated['success_url'],
                $validated['cancel_url'],
                $order->id
            );

            // Créer ou mettre à jour l'enregistrement de paiement
            Payment::updateOrCreate(
                [
                    'order_id' => $order->id,
                    'status' => 'pending'
                ],
                [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'stripe_session_id' => $session->id,
                    'customer_email' => $user->email,
                    'expires_at' => now()->addMinutes(30),
                    'amount' => $order->total_amount,
                    'currency' => strtolower($order->currency),
                    'status' => 'pending',
                ]
            );

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'session_id' => $session->id,
                'checkout_url' => $session->url,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du checkout',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/payments/verify/{sessionId}",
     *     operationId="verify-payment",
     *     tags={"Stripe Payments"},
     *     summary="Verify Payment Status",
     *     description="Verify the status of a payment using the Stripe session ID",
     *     security={{"sanctum": {}}},
     *
     *     @OA\Parameter(
     *         name="sessionId",
     *         in="path",
     *         required=true,
     *         description="Stripe Checkout Session ID",
     *         @OA\Schema(type="string", example="cs_test_1234567890")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Payment verified successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="payment",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="order_id", type="integer", example=123),
     *                 @OA\Property(property="amount", type="number", format="float", example=49.99),
     *                 @OA\Property(property="currency", type="string", example="eur"),
     *                 @OA\Property(property="status", type="string", example="success"),
     *                 @OA\Property(property="paid_at", type="string", format="date-time", example="2024-01-01T12:00:00Z")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Payment not found"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */

    public function verifyPayment(string $sessionId)
    {
        try {
            $user = auth()->user();
            
            // Récupérer le paiement par session_id
            $payment = Payment::where('stripe_session_id', $sessionId)->first();
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement introuvable',
                ], 404);
            }
            
            // Vérifier que le paiement appartient à l'utilisateur
            if ($payment->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé',
                ], 403);
            }
            
            return response()->json([
                'success' => true,
                'payment' => [
                    'id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                ],
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
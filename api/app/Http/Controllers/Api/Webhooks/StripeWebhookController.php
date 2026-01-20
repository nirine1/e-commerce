<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    /**
     * @OA\Post(
     *    path="/webhooks/stripe",
     *    operationId="stripe-webhook",
     *    tags={"Stripe Payments"},
     *    summary="Handle Stripe webhooks",
     *    description="Endpoint to receive Stripe webhook events",
     *    @OA\Response(
     *       response=200,
     *       description="Webhook processed successfully"
     *    )
     * )
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);

            // Traiter l'événement selon son type
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;

                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;

                default:
                    Log::info('Unhandled webhook event type: ' . $event->type);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::channel('stripe')->error('Webhook error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    private function handleCheckoutSessionCompleted($session)
    {
        Log::channel('stripe')->info('Checkout session completed', [
            'session_id' => $session->id,
            'customer_email' => $session->customer_email,
            'amount_total' => $session->amount_total,
        ]);

        // Ici, tu peux :
        // - Enregistrer la transaction dans ta DB
        // - Mettre à jour le statut de la commande
        // - Envoyer un email de confirmation
        // - etc.
    }
}
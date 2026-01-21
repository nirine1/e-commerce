<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Cart;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\StripeService;

class StripeWebhookController extends Controller
{
    public function __construct(private StripeService $stripeService)
    {
    }
    
    /**
     * Point d'entrée pour tous les webhooks Stripe
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);

            Log::channel('stripe')->info('Webhook received', [
                'type' => $event->type,
                'id' => $event->id
            ]);

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
                    Log::channel('stripe')->info('Unhandled webhook event type: ' . $event->type);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::channel('stripe')->error('Webhook error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Gérer l'événement checkout.session.completed
     * C'est l'événement principal qui se déclenche quand le paiement est terminé
     */
    private function handleCheckoutSessionCompleted($session)
    {
        Log::channel('stripe')->info('Processing checkout.session.completed', [
            'session_id' => $session->id,
            'customer_email' => $session->customer_email,
            'amount_total' => $session->amount_total,
            'payment_status' => $session->payment_status,
        ]);

        // Récupérer l'order_id depuis les metadata
        $orderId = $session->metadata->order_id ?? null;
        $userId = $session->metadata->user_id ?? null;

        if (!$orderId || !$userId) {
            Log::channel('stripe')->error('Missing metadata in checkout session', [
                'session_id' => $session->id,
                'order_id' => $orderId,
                'user_id' => $userId,
            ]);
            return;
        }

        try {
            // Récupérer l'utilisateur
            $user = User::find($userId);
            if (!$user) {
                Log::channel('stripe')->error('User not found', ['user_id' => $userId]);
                return;
            }

            // Récupérer la commande
            $order = Order::find($orderId);
            if (!$order) {
                Log::channel('stripe')->error('Order not found', ['order_id' => $orderId]);
                return;
            }

            // Mettre à jour ou créer le paiement
            $payment = Payment::updateOrCreate(
                ['stripe_session_id' => $session->id],
                [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'stripe_payment_intent_id' => $session->payment_intent,
                    'customer_email' => $user->email,
                    'amount' => $session->amount_total / 100, // Convertir centimes en euros
                    'currency' => $session->currency,
                    'status' => $session->payment_status === 'paid' ? 'success' : 'pending',
                    'payment_method' => 'card',
                    'description' => "Commande #{$order->order_number}",
                    'paid_at' => $session->payment_status === 'paid' ? now() : null,
                ]
            );

            // Si le paiement est réussi, mettre à jour la commande
            if ($session->payment_status === 'paid') {

                // Vider le panier de l'utilisateur
                Cart::where('user_id', $user->id)->delete();

                Log::channel('stripe')->info('Payment successful, order updated, cart cleared', [
                    'payment_id' => $payment->id,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]);
            }

        } catch (\Throwable $th) {
            Log::channel('stripe')->error('Error processing checkout session completed', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
                'session_id' => $session->id,
            ]);
        }
    }
    
    /**
     * Gérer l'événement payment_intent.succeeded
     * Événement de confirmation supplémentaire
     */
    private function handlePaymentSucceeded($paymentIntent)
    {
        Log::channel('stripe')->info('Processing payment_intent.succeeded', [
            'payment_intent_id' => $paymentIntent->id,
            'amount' => $paymentIntent->amount,
            'status' => $paymentIntent->status,
        ]);

        try {
            // Trouver le paiement par payment_intent_id
            $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
            
            if ($payment) {
                // Mettre à jour le statut si ce n'est pas déjà fait
                if ($payment->status !== 'success') {
                    $payment->update([
                        'status' => 'success',
                        'paid_at' => now(),
                    ]);

                    Log::channel('stripe')->info('Payment status updated to success', [
                        'payment_id' => $payment->id,
                    ]);
                }
            } else {
                Log::channel('stripe')->warning('Payment not found for payment_intent', [
                    'payment_intent_id' => $paymentIntent->id,
                ]);
            }

        } catch (\Throwable $th) {
            Log::channel('stripe')->error('Error processing payment_intent.succeeded', [
                'error' => $th->getMessage(),
                'payment_intent_id' => $paymentIntent->id,
            ]);
        }
    }

    /**
     * Gérer l'événement payment_intent.payment_failed
     * Quand le paiement échoue
     */
    private function handlePaymentFailed($paymentIntent)
    {
        Log::channel('stripe')->warning('Processing payment_intent.payment_failed', [
            'payment_intent_id' => $paymentIntent->id,
            'last_payment_error' => $paymentIntent->last_payment_error?->message ?? 'Unknown error',
        ]);

        try {
            // Trouver le paiement par payment_intent_id
            $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
            
            if ($payment) {
                // Mettre à jour le statut en échec
                $payment->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                    'metadata' => [
                        'error_message' => $paymentIntent->last_payment_error?->message ?? 'Payment failed',
                        'error_code' => $paymentIntent->last_payment_error?->code ?? null,
                    ],
                ]);

                // Mettre à jour la commande en annulée
                if ($payment->order) {
                    $payment->order->update([
                        'status' => 'cancelled',
                    ]);
                }

                Log::channel('stripe')->info('Payment and order marked as failed', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                ]);
            } else {
                Log::channel('stripe')->warning('Payment not found for failed payment_intent', [
                    'payment_intent_id' => $paymentIntent->id,
                ]);
            }

        } catch (\Throwable $th) {
            Log::channel('stripe')->error('Error processing payment_intent.payment_failed', [
                'error' => $th->getMessage(),
                'payment_intent_id' => $paymentIntent->id,
            ]);
        }
    }
}
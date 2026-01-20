<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use App\Services\StripeService;
use App\Models\User;


class StripeWebhookController extends Controller
{
    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }
    
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
                    Log::channel('stripe')->info('Unhandled webhook event type: ' . $event->type);
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
    }
    
    private function handlePaymentSucceeded($session)
    {
        $user = User::where('email', $session->customer_email)->first();
        Log::channel('stripe')->info('Checkout session completed', [
            'session_id' => $session->id,
            'customer_email' => $session->customer_email,
            'amount_total' => $session->amount_total,
        ]);

        try {
            $payment = Payment::create([
                'user_id' => $user->id,
                'stripe_session_id' => $session->id,
                'customer_email' => $user->email,
                'amount' => $session->amount_total / 100, // Convertir centimes en euros
                'currency' => $session->currency,
                'status' => 'success',
                'description' => $session->description,
                'checkout_url' => $session->url,
                'expires_at' => now()->addMinutes(30),
            ]);

            Log::channel('stripe')->info('Payment record created', ['payment_id' => $payment->id]);
        } catch (\Throwable $th) {
            Log::channel('stripe')->error('Error creating payment record: ' . $th->getMessage());
        }
    }
}
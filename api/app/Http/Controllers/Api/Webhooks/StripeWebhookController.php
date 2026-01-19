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
    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $endpointSecret
            );
        } catch (\UnexpectedValueException $e) {
            Log::channel('stripe')->error('Webhook payload error: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::channel('stripe')->error('Webhook signature error: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        Log::channel('stripe')->info('Webhook received: ' . $event->type);

        switch ($event->type) {
            case 'payment_intent.created':
                $this->handlePaymentIntentCreated($event->data->object);
                break;
            
            default:
                Log::channel('stripe')->info('Unhandled event type: ' . $event->type);
                break;
        }

        return response()->json(['status' => 'success'], 200);
    }

    public function handlePaymentIntentCreated($paymentIntent)
    {
        Log::channel('stripe')->info('Payment Intent Created: ' . $paymentIntent->id);

        try {
            $payment = Payment::create([
                'stripe_payment_intent_id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'status' => $paymentIntent->status,
                'user_id' => $paymentIntent->metadata->user_id ?? null,
            ]);

            Log::channel('stripe')->info('Payment record created successfully: ' . $payment->id);
            
            return $payment;
        } catch (\Throwable $th) {
            Log::channel('stripe')->error('Failed to create payment record: ' . $th->getMessage());
            throw $th; // Re-throw pour que Stripe réessaye
        }
    }
}
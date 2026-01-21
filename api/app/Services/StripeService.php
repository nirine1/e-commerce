<?php

namespace App\Services;

use Stripe\StripeClient;
use Stripe\Webhook;
use Stripe\Checkout\Session;

class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Créer une session Stripe Checkout
     */
    public function createCheckoutSession(
        float $amount, 
        $user, 
        string $successUrl, 
        string $cancelUrl, 
        int $orderId
    ): Session
    {
        $session = $this->stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => 'Commande #' . $orderId,
                        'description' => 'Paiement de la commande',
                    ],
                    'unit_amount' => (int)($amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'customer_email' => $user->email,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'user_id' => $user->id,
                'order_id' => $orderId,
            ],
        ]);

        return $session;
    }

    /**
     * Récupérer une session Stripe par son ID
     */
    public function retrieveSession(string $sessionId): Session
    {
        return Session::retrieve($sessionId);
    }

    /**
     * Construire et valider un événement webhook Stripe
     */
    public function constructWebhookEvent(string $payload, string $sigHeader)
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        return Webhook::constructEvent(
            $payload,
            $sigHeader,
            $webhookSecret
        );
    }
}
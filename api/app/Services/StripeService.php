<?php

namespace App\Services;

use Stripe\StripeClient;
use Stripe\Webhook;
use App\Models\User;

class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function createCheckoutSession(User $user, int $amount, string $currency, string $description)
    {
        $session = $this->stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => $currency,
                    'product_data' => [
                        'name' => $description,
                    ],
                    'unit_amount' => $amount,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/payment/cancel',
            'customer_email' => $user->email,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        return [
            'id' => $session->id,
            'url' => $session->url,
        ];
    }

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
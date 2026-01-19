<?php 

namespace App\Services;

use Stripe\Stripe;
use Stripe\Customer;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Config;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Webhook;
use Illuminate\Support\Str;

class StripeService {
    public function __construct() {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function getOrCreateCustomer(User $user): Customer {
        if ($user->stripe_customer_id) {
            return Customer::retrieve($user->stripe_customer_id);
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
        ]);
        
        $user->stripe_customer_id = $customer->id;
        $user->save();

        return $customer;
    }

    public function createPaymentIntent(User $user, int $amount, string $currency = 'eur'): PaymentIntent {
        $customer = $this->getOrCreateCustomer($user);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'customer' => $customer->id,
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $th) {
            throw new Exception('Payment processing failed. Please try again later.');
        }
    }

    public function confirmPaymentIntent(string $paymentIntentId): PaymentIntent {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            $paymentIntent->confirm([
                'return_url' => 'http://localhost:3000/payment-success',
                'payment_method_options' => [
                    'card' => [
                        'request_three_d_secure' => 'any',
                    ],
                ],
            ]);
            return $paymentIntent;
        } catch (ApiErrorException $th) {
            Log::channel('stripe')->error('Error confirming payment intent: ' . $th->getMessage());
            throw new Exception('Payment confirmation failed. Please try again later.');
        }
    }
}
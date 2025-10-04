<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Customize the password reset link to point to the front-end
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return env('VITE_APP_URL', 'http://localhost:3000')
                . '/reset-password?token=' . $token 
                . '&email=' . urlencode($user->email);
        });
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Renommer la colonne pour Checkout Session au lieu de Payment Intent
            $table->renameColumn('stripe_payment_intent_id', 'stripe_session_id');
            
            // Ajouter la colonne payment_intent_id séparément (elle sera remplie par le webhook)
            $table->string('stripe_payment_intent_id')->nullable()->after('stripe_session_id');
            
            // Modifier/ajouter les colonnes manquantes
            $table->string('checkout_url')->nullable()->after('stripe_customer_id');
            $table->timestamp('expires_at')->nullable()->after('checkout_url');
            $table->string('customer_email')->nullable()->after('stripe_customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('stripe_session_id', 'stripe_payment_intent_id');
            $table->dropColumn([
                'stripe_payment_intent_id',
                'checkout_url',
                'expires_at',
                'customer_email'
            ]);
        });
    }
};
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Notifications\ResetPassword;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_password_reset_link(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'john@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'john@example.com',
        ]);

        $response->assertStatus(200);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_reset_request_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_request_fails_with_missing_email(): void
    {
        $response = $this->postJson('/api/forgot-password', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_request_fails_with_invalid_email_format(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('oldpassword123'),
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertFalse(Hash::check('oldpassword123', $user->password));

        // Verify token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'john@example.com',
        ]);
    }

    public function test_password_reset_fails_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => 'john@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);

        // Verify password was NOT changed
        $user->refresh();
        $this->assertTrue(Hash::check('oldpassword123', $user->password));
    }

    public function test_password_reset_fails_with_mismatched_passwords(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    public function test_password_reset_fails_with_short_password(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    public function test_password_reset_fails_with_missing_token(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email' => 'john@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['token']);
    }

    public function test_password_reset_fails_with_missing_email(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'token' => 'some-token',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_fails_with_wrong_email(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'wrong@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_token_can_be_used_only_once(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('oldpassword123'),
        ]);

        $token = Password::broker()->createToken($user);

        // First reset should succeed
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200);

        // Second reset with same token should fail
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'anotherpassword123',
            'password_confirmation' => 'anotherpassword123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);

        // Verify password is still the first new password
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertFalse(Hash::check('anotherpassword123', $user->password));
    }
}

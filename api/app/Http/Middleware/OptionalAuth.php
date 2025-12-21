<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;

class OptionalAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken(); // Get token from Authorization header
        
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token); // Find the token in the database
            
            if ($accessToken) {
                $user = $accessToken->tokenable; // Get the associated user
                
                auth()->setUser($user); // Set the authenticated user
                auth('sanctum')->setUser($user); // Set the authenticated user for sanctum guard
                
                $request->attributes->set('sanctum_token', $accessToken); // Optionally set the token in request attributes
            }
        }
        
        return $next($request);
    }
}

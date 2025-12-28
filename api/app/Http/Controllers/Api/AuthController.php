<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(
 *     name="Auth",
 *     description="Authentication endpoints - manage user authentication"
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *    path="/register",
     *    operationId="register-user",
     *    tags={"Auth"},
     *    summary="Register a new user",
     *    description="Creates a new user account and returns an authentication token",
     *
     *    @OA\RequestBody(
     *       required=true,
     *
     *       @OA\JsonContent(
     *         required={"name","email","password"},
     *
     *         @OA\Property(
     *           property="name",
     *           type="string",
     *           example="John Doe",
     *           description="Full name of the user"
     *         ),
     *         @OA\Property(
     *           property="email",
     *           type="string",
     *           format="email",
     *           example="john.doe@example.com",
     *           description="Email address of the user"
     *         ),
     *         @OA\Property(
     *           property="password",
     *           type="string",
     *           format="password",
     *           example="password123",
     *           description="Password for the account"
     *         )
     *       )
     *    ),
     *
     *    @OA\Response(
     *       response=201,
     *       description="User registered successfully",
     *
     *       @OA\JsonContent(
     *
     *         @OA\Property(
     *           property="user",
     *           type="object",
     *           @OA\Property(property="id", type="integer", example=1),
     *           @OA\Property(property="name", type="string", example="John Doe"),
     *           @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *           @OA\Property(property="created_at", type="string", format="date-time"),
     *           @OA\Property(property="updated_at", type="string", format="date-time")
     *         ),
     *         @OA\Property(
     *           property="token",
     *           type="string",
     *           example="1|abcdefghijklmnopqrstuvwxyz123456789"
     *         )
     *       )
     *    ),
     *
     *    @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(RegisterRequest $request)
    {
        $user = new User;
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = $request->password; // Auto Hashed
        $user->save();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Post(
     *    path="/login",
     *    operationId="login-user",
     *    tags={"Auth"},
     *    summary="Authenticate user",
     *    description="Logs in an existing user and returns an authentication token",
     *
     *    @OA\RequestBody(
     *       required=true,
     *
     *       @OA\JsonContent(
     *         required={"email","password"},
     *
     *         @OA\Property(
     *           property="email",
     *           type="string",
     *           format="email",
     *           example="john.doe@example.com",
     *           description="Email address of the user"
     *         ),
     *         @OA\Property(
     *           property="password",
     *           type="string",
     *           format="password",
     *           example="password123",
     *           description="Password for the account"
     *         )
     *       )
     *    ),
     *
     *    @OA\Response(
     *       response=200,
     *       description="Login successful",
     *
     *       @OA\JsonContent(
     *
     *         @OA\Property(
     *           property="user",
     *           type="object",
     *           @OA\Property(property="id", type="integer", example=1),
     *           @OA\Property(property="name", type="string", example="John Doe"),
     *           @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *           @OA\Property(property="created_at", type="string", format="date-time"),
     *           @OA\Property(property="updated_at", type="string", format="date-time")
     *         ),
     *         @OA\Property(
     *           property="token",
     *           type="string",
     *           example="2|abcdefghijklmnopqrstuvwxyz123456789"
     *         )
     *       )
     *    ),
     *
     *    @OA\Response(
     *       response=422,
     *       description="Invalid credentials",
     *
     *       @OA\JsonContent(
     *
     *         @OA\Property(
     *           property="message",
     *           type="string",
     *           example="The given data was invalid."
     *         ),
     *         @OA\Property(
     *           property="errors",
     *           type="object",
     *           @OA\Property(
     *             property="email",
     *             type="array",
     *
     *             @OA\Items(type="string", example="Les informations fournies ne sont pas cohérentes.")
     *           )
     *         )
     *       )
     *    )
     * )
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations fournies ne sont pas cohérentes.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], Response::HTTP_OK);
    }

    /**
     * @OA\Post(
     *    path="/logout",
     *    operationId="logout-user",
     *    tags={"Auth"},
     *    summary="Logout user",
     *    description="Revokes the current access token and logs out the user",
     *    security={{"sanctum":{}}},
     *
     *    @OA\Response(
     *       response=200,
     *       description="Logout successful",
     *
     *       @OA\JsonContent(
     *
     *         @OA\Property(
     *           property="message",
     *           type="string",
     *           example="Déconnecté avec succès"
     *         )
     *       )
     *    ),
     *
     *    @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès',
        ], Response::HTTP_OK);
    }

    /**
     * @OA\Get(
     *    path="/user",
     *    operationId="get-current-user",
     *    tags={"Auth"},
     *    summary="Get current authenticated user",
     *    description="Returns the currently authenticated user's information",
     *    security={{"sanctum":{}}},
     *
     *    @OA\Response(
     *       response=200,
     *       description="User data retrieved successfully",
     *
     *       @OA\JsonContent(
     *
     *         @OA\Property(
     *           property="user",
     *           type="object",
     *           @OA\Property(property="id", type="integer", example=1),
     *           @OA\Property(property="name", type="string", example="John Doe"),
     *           @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *           @OA\Property(property="created_at", type="string", format="date-time"),
     *           @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *       )
     *    ),
     *
     *    @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ], Response::HTTP_OK);
    }
}

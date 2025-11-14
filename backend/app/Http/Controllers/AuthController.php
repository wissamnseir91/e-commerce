<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Traits\ResponseFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ResponseFormatter;

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->successResponse([
                'user' => $user,
                'token' => $token,
            ], 'User registered successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to register user', $e->getMessage(), 500);
        }
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            if (!Auth::attempt($request->only('email', 'password'))) {
                return $this->errorResponse('Invalid credentials', null, 401);
            }

            $user = User::where('email', $request->email)->firstOrFail();
            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->successResponse([
                'user' => $user,
                'token' => $token,
            ], 'Login successful');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to login', $e->getMessage(), 500);
        }
    }

    /**
     * Logout user.
     */
    public function logout(): JsonResponse
    {
        try {
            Auth::user()->currentAccessToken()->delete();

            return $this->successResponse(null, 'Logout successful');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to logout', $e->getMessage(), 500);
        }
    }

    /**
     * Get authenticated user.
     */
    public function user(): JsonResponse
    {
        try {
            return $this->successResponse(Auth::user(), 'User retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve user', $e->getMessage(), 500);
        }
    }
}

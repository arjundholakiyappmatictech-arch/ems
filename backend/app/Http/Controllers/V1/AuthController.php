<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Auth\LoginRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login(
                $request->validated(),
                $request->input('device_name', 'api')
            );

            return $this->successResponse('Login successful.', [
                'token' => $result['token'],
                'user' => new UserResource($result['user']),
            ]);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());

            return $this->successResponse('Logged out successfully.');
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function me(Request $request): JsonResponse
    {
        try {
            $user = $this->authService->me($request->user());

            return $this->successResponse('Current user profile retrieved.', new UserResource($user));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }
}


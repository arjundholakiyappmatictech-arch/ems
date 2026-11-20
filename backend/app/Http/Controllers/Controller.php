<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Throwable;

abstract class Controller
{
    /**
     * Standard success response envelope (ADR-001).
     */
    protected function successResponse(string $message, mixed $data = null, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'is_error' => false,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Standard error response envelope (ADR-001).
     */
    protected function errorResponse(string $message, int $statusCode = 400, ?array $errors = null): JsonResponse
    {
        $payload = [
            'is_error' => true,
            'message' => $message,
            'data' => null,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $statusCode);
    }

    /**
     * Single catch-block exception handler delegator.
     * Sanitizes status codes to 100-599 and masks raw SQL traces.
     */
    protected function handleException(Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        if ($e instanceof AuthenticationException) {
            return $this->errorResponse('Unauthenticated.', 401);
        }

        if ($e instanceof AuthorizationException) {
            return $this->errorResponse($e->getMessage() ?: 'Unauthorized.', 403);
        }

        if ($e instanceof ModelNotFoundException) {
            return $this->errorResponse('Resource not found.', 404);
        }

        if ($e instanceof QueryException) {
            // Mask database implementation details from client/agent
            return $this->errorResponse('A database integrity error occurred.', 500);
        }

        $code = (int) $e->getCode();
        $statusCode = ($code >= 100 && $code <= 599) ? $code : 500;

        return $this->errorResponse($e->getMessage() ?: 'An unexpected error occurred.', $statusCode);
    }
}

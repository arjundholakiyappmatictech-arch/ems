<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

abstract class Controller
{
    /**
     * Standard success response envelope (ADR-001).
     * Automatically attaches clean pagination meta when paginated resource collections are passed.
     */
    public static function successResponse(string $message, mixed $data = null, int $statusCode = 200): JsonResponse
    {
        $payload = [
            'is_error' => false,
            'message' => $message,
            'data' => $data,
        ];

        if ($data instanceof ResourceCollection && $data->resource instanceof LengthAwarePaginator) {
            $paginator = $data->resource;
            $payload['data'] = $data->collection;
            $payload['pagination'] = [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'current_page_url' => $paginator->url($paginator->currentPage()),
                'next_page_url' => $paginator->nextPageUrl(),
                'prev_page_url' => $paginator->previousPageUrl(),
                'has_more_pages' => $paginator->hasMorePages(),
                'has_data' => $paginator->isNotEmpty(),
            ];
        } elseif ($data instanceof LengthAwarePaginator) {
            $payload['data'] = $data->items();
            $payload['pagination'] = [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage(),
                'current_page_url' => $data->url($data->currentPage()),
                'next_page_url' => $data->nextPageUrl(),
                'prev_page_url' => $data->previousPageUrl(),
                'has_more_pages' => $data->hasMorePages(),
                'has_data' => $data->isNotEmpty(),
            ];
        }

        return response()->json($payload, $statusCode);
    }

    /**
     * Standard error response envelope (ADR-001).
     */
    public static function errorResponse(string $message, int $statusCode = 400, ?array $errors = null): JsonResponse
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
     * Single canonical exception formatter for both controller catch blocks and framework pipeline.
     */
    public static function formatException(Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return static::errorResponse($e->getMessage(), 422, $e->errors());
        }

        if ($e instanceof AuthenticationException) {
            return static::errorResponse('Unauthenticated.', 401);
        }

        if ($e instanceof AuthorizationException) {
            return static::errorResponse($e->getMessage() ?: 'Unauthorized.', 403);
        }

        if ($e instanceof ModelNotFoundException) {
            return static::errorResponse('Resource not found.', 404);
        }

        if ($e instanceof QueryException) {
            Log::error('QueryException: ' . $e->getMessage(), [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'code' => $e->getCode(),
            ]);

            return static::errorResponse('A database integrity error occurred.', 500);
        }

        if ($e instanceof HttpExceptionInterface) {
            return static::errorResponse($e->getMessage() ?: 'HTTP error occurred.', $e->getStatusCode());
        }

        $code = (int) $e->getCode();
        $statusCode = ($code >= 100 && $code <= 599) ? $code : 500;

        return static::errorResponse($e->getMessage() ?: 'An unexpected error occurred.', $statusCode);
    }

    /**
     * Single catch-block exception handler delegator.
     */
    protected function handleException(Throwable $e): JsonResponse
    {
        return static::formatException($e);
    }
}

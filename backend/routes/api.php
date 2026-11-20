<?php

use App\Http\Controllers\V1\AttendanceController;
use App\Http\Controllers\V1\AuthController;
use App\Http\Controllers\V1\DailyReportController;
use App\Http\Controllers\V1\DepartmentController;
use App\Http\Controllers\V1\DesignationController;
use App\Http\Controllers\V1\EmployeeController;
use App\Http\Controllers\V1\LeaveRequestController;
use App\Http\Controllers\V1\LeaveTypeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentication Feature
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Authenticated Core HR Endpoints
    Route::middleware('auth:sanctum')->group(function () {
        // Departments Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('departments')->group(function () {
            Route::get('', [DepartmentController::class, 'index']);
            Route::get('{id}', [DepartmentController::class, 'show']);
            Route::post('store', [DepartmentController::class, 'store']);
            Route::post('{id}/update', [DepartmentController::class, 'update']);
            Route::post('{id}/destroy', [DepartmentController::class, 'destroy']);
        });

        // Designations Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('designations')->group(function () {
            Route::get('', [DesignationController::class, 'index']);
            Route::get('{id}', [DesignationController::class, 'show']);
            Route::post('store', [DesignationController::class, 'store']);
            Route::post('{id}/update', [DesignationController::class, 'update']);
            Route::post('{id}/destroy', [DesignationController::class, 'destroy']);
        });

        // Employees Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('employees')->group(function () {
            Route::get('', [EmployeeController::class, 'index']);
            Route::get('{id}', [EmployeeController::class, 'show']);
            Route::post('store', [EmployeeController::class, 'store']);
            Route::post('{id}/update', [EmployeeController::class, 'update']);
            Route::post('{id}/status', [EmployeeController::class, 'updateStatus']);
            Route::post('{id}/destroy', [EmployeeController::class, 'destroy']);
        });

        // Attendance & Punch Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('attendances')->group(function () {
            Route::get('', [AttendanceController::class, 'index']);
            Route::get('today', [AttendanceController::class, 'today']);
            Route::post('clock-in', [AttendanceController::class, 'clockIn']);
            Route::post('clock-out', [AttendanceController::class, 'clockOut']);
        });

        // Daily Work Reports Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('daily-reports')->group(function () {
            Route::get('', [DailyReportController::class, 'index']);
            Route::get('{id}', [DailyReportController::class, 'show']);
            Route::post('store', [DailyReportController::class, 'store']);
            Route::post('{id}/update', [DailyReportController::class, 'update']);
            Route::post('{id}/review', [DailyReportController::class, 'review']);
        });

        // Leave Types Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('leave-types')->group(function () {
            Route::get('', [LeaveTypeController::class, 'index']);
            Route::get('{id}', [LeaveTypeController::class, 'show']);
            Route::post('store', [LeaveTypeController::class, 'store']);
            Route::post('{id}/update', [LeaveTypeController::class, 'update']);
            Route::post('{id}/destroy', [LeaveTypeController::class, 'destroy']);
        });

        // Leave Requests State Machine Feature (Strict 2-Verb: GET & POST Only)
        Route::prefix('leave-requests')->group(function () {
            Route::get('', [LeaveRequestController::class, 'index']);
            Route::get('{id}', [LeaveRequestController::class, 'show']);
            Route::post('store', [LeaveRequestController::class, 'store']);
            Route::post('{id}/approve', [LeaveRequestController::class, 'approve']);
            Route::post('{id}/reject', [LeaveRequestController::class, 'reject']);
            Route::post('{id}/cancel', [LeaveRequestController::class, 'cancel']);
        });
    });
});

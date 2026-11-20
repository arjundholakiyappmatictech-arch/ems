<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Attendance\ClockInRequest;
use App\Http\Requests\V1\Attendance\ClockOutRequest;
use App\Http\Resources\V1\AttendanceResource;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $attendances = $this->attendanceService->list($request->user(), $request->query());

            return $this->successResponse(
                'Attendance records retrieved successfully.',
                AttendanceResource::collection($attendances)->response()->getData(true)
            );
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function today(Request $request): JsonResponse
    {
        try {
            $status = $this->attendanceService->getTodayStatus($request->user());

            return $this->successResponse('Today punch status retrieved.', [
                'is_clocked_in' => $status['is_clocked_in'],
                'is_clocked_out' => $status['is_clocked_out'],
                'attendance' => $status['attendance'] ? new AttendanceResource($status['attendance']) : null,
            ]);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function clockIn(ClockInRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $attendance = $this->attendanceService->clockIn($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Clocked in successfully.', new AttendanceResource($attendance), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $attendance = $this->attendanceService->clockOut($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Clocked out successfully.', new AttendanceResource($attendance));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


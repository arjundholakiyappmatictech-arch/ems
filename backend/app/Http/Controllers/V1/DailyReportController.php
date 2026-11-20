<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\DailyReport\ReviewDailyReportRequest;
use App\Http\Requests\V1\DailyReport\StoreDailyReportRequest;
use App\Http\Requests\V1\DailyReport\UpdateDailyReportRequest;
use App\Http\Resources\V1\DailyReportResource;
use App\Models\DailyReport;
use App\Services\DailyReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class DailyReportController extends Controller
{
    public function __construct(
        protected DailyReportService $dailyReportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $reports = $this->dailyReportService->list($request->user(), $request->query());

            return $this->successResponse(
                'Daily work reports retrieved successfully.',
                DailyReportResource::collection($reports)
            );
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $report = $this->dailyReportService->getById($request->user(), $id);

            return $this->successResponse('Daily report retrieved.', new DailyReportResource($report));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function store(StoreDailyReportRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $report = $this->dailyReportService->store($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Daily work report submitted successfully.', new DailyReportResource($report), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function update(UpdateDailyReportRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $report = DailyReport::findOrFail($id);
            $updated = $this->dailyReportService->update($request->user(), $report, $request->validated());
            DB::commit();

            return $this->successResponse('Daily work report updated successfully.', new DailyReportResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function review(ReviewDailyReportRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $report = DailyReport::findOrFail($id);
            $updated = $this->dailyReportService->review(
                $request->user(),
                $report,
                $request->validated('manager_remarks')
            );
            DB::commit();

            return $this->successResponse('Daily report reviewed successfully.', new DailyReportResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


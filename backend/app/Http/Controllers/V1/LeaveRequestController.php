<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Leave\RejectLeaveRequest;
use App\Http\Requests\V1\Leave\StoreLeaveRequest;
use App\Http\Resources\V1\LeaveRequestResource;
use App\Models\LeaveRequest;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class LeaveRequestController extends Controller
{
    public function __construct(
        protected LeaveService $leaveService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $requests = $this->leaveService->listRequests($request->user(), $request->query());

            return $this->successResponse(
                'Leave requests retrieved successfully.',
                LeaveRequestResource::collection($requests)->response()->getData(true)
            );
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $leaveRequest = $this->leaveService->getRequestById($request->user(), $id);

            return $this->successResponse('Leave request retrieved.', new LeaveRequestResource($leaveRequest));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function store(StoreLeaveRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $leaveRequest = $this->leaveService->storeRequest($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Leave request submitted successfully.', new LeaveRequestResource($leaveRequest), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $leaveRequest = LeaveRequest::findOrFail($id);
            $approved = $this->leaveService->approveRequest($request->user(), $leaveRequest);
            DB::commit();

            return $this->successResponse('Leave request approved successfully.', new LeaveRequestResource($approved));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function reject(RejectLeaveRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $leaveRequest = LeaveRequest::findOrFail($id);
            $rejected = $this->leaveService->rejectRequest(
                $request->user(),
                $leaveRequest,
                $request->validated('action_reason')
            );
            DB::commit();

            return $this->successResponse('Leave request rejected successfully.', new LeaveRequestResource($rejected));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $leaveRequest = LeaveRequest::findOrFail($id);
            $cancelled = $this->leaveService->cancelRequest($request->user(), $leaveRequest);
            DB::commit();

            return $this->successResponse('Leave request cancelled successfully.', new LeaveRequestResource($cancelled));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


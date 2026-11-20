<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Leave\StoreLeaveTypeRequest;
use App\Http\Requests\V1\Leave\UpdateLeaveTypeRequest;
use App\Http\Resources\V1\LeaveTypeResource;
use App\Models\LeaveType;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class LeaveTypeController extends Controller
{
    public function __construct(
        protected LeaveService $leaveService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $types = $this->leaveService->listTypes($request->query());

            return $this->successResponse('Leave types retrieved successfully.', LeaveTypeResource::collection($types));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $type = $this->leaveService->getTypeById($id);

            return $this->successResponse('Leave type retrieved.', new LeaveTypeResource($type));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function store(StoreLeaveTypeRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $type = $this->leaveService->storeType($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Leave type created successfully.', new LeaveTypeResource($type), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function update(UpdateLeaveTypeRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $type = LeaveType::findOrFail($id);
            $updated = $this->leaveService->updateType($request->user(), $type, $request->validated());
            DB::commit();

            return $this->successResponse('Leave type updated successfully.', new LeaveTypeResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $type = LeaveType::findOrFail($id);
            $this->leaveService->destroyType($request->user(), $type);
            DB::commit();

            return $this->successResponse('Leave type deleted successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


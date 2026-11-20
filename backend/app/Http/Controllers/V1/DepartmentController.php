<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Department\StoreDepartmentRequest;
use App\Http\Requests\V1\Department\UpdateDepartmentRequest;
use App\Http\Resources\V1\DepartmentResource;
use App\Models\Department;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class DepartmentController extends Controller
{
    public function __construct(
        protected DepartmentService $departmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $departments = $this->departmentService->list($request->query());

            return $this->successResponse(
                'Departments retrieved successfully.',
                DepartmentResource::collection($departments)
            );
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $department = $this->departmentService->getById($id);

            return $this->successResponse('Department retrieved successfully.', new DepartmentResource($department));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $department = $this->departmentService->store($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Department created successfully.', new DepartmentResource($department), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function update(UpdateDepartmentRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $department = Department::findOrFail($id);
            $updated = $this->departmentService->update($request->user(), $department, $request->validated());
            DB::commit();

            return $this->successResponse('Department updated successfully.', new DepartmentResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $department = Department::findOrFail($id);
            $this->departmentService->destroy($request->user(), $department);
            DB::commit();

            return $this->successResponse('Department deleted successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


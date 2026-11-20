<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Employee\StoreEmployeeRequest;
use App\Http\Requests\V1\Employee\UpdateEmployeeRequest;
use App\Http\Requests\V1\Employee\UpdateEmployeeStatusRequest;
use App\Http\Resources\V1\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $employees = $this->employeeService->list($request->user(), $request->query());

            return $this->successResponse(
                'Employees retrieved successfully.',
                EmployeeResource::collection($employees)->response()->getData(true)
            );
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $employee = $this->employeeService->getById($id);

            return $this->successResponse('Employee profile retrieved.', new EmployeeResource($employee));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $employee = $this->employeeService->store($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Employee onboarded successfully.', new EmployeeResource($employee), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $employee = Employee::findOrFail($id);
            $updated = $this->employeeService->update($request->user(), $employee, $request->validated());
            DB::commit();

            return $this->successResponse('Employee profile updated.', new EmployeeResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function updateStatus(UpdateEmployeeStatusRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $employee = Employee::findOrFail($id);
            $updated = $this->employeeService->updateStatus(
                $request->user(),
                $employee,
                $request->validated('status'),
                $request->validated('reason')
            );
            DB::commit();

            return $this->successResponse('Employee status updated successfully.', new EmployeeResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $employee = Employee::findOrFail($id);
            $this->employeeService->destroy($request->user(), $employee);
            DB::commit();

            return $this->successResponse('Employee record deleted successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


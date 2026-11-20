<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Designation\StoreDesignationRequest;
use App\Http\Requests\V1\Designation\UpdateDesignationRequest;
use App\Http\Resources\V1\DesignationResource;
use App\Models\Designation;
use App\Services\DesignationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class DesignationController extends Controller
{
    public function __construct(
        protected DesignationService $designationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $designations = $this->designationService->list($request->query());

            return $this->successResponse(
                'Designations retrieved successfully.',
                DesignationResource::collection($designations)->response()->getData(true)
            );
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $designation = $this->designationService->getById($id);

            return $this->successResponse('Designation retrieved successfully.', new DesignationResource($designation));
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function store(StoreDesignationRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $designation = $this->designationService->store($request->user(), $request->validated());
            DB::commit();

            return $this->successResponse('Designation created successfully.', new DesignationResource($designation), 201);
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function update(UpdateDesignationRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $designation = Designation::findOrFail($id);
            $updated = $this->designationService->update($request->user(), $designation, $request->validated());
            DB::commit();

            return $this->successResponse('Designation updated successfully.', new DesignationResource($updated));
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $designation = Designation::findOrFail($id);
            $this->designationService->destroy($request->user(), $designation);
            DB::commit();

            return $this->successResponse('Designation deleted successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            return $this->handleException($e);
        }
    }
}


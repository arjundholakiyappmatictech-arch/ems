<?php

namespace App\Services;

use App\Exceptions\Auth\UnauthorizedRoleException;
use App\Exceptions\Organization\CannotDeleteDepartmentException;
use App\Models\Department;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class DepartmentService
{
    /**
     * List departments with optional pagination and search.
     *
     * @param  array{search?: string, per_page?: int, paginate?: bool}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator|Collection
    {
        $query = Department::query()
            ->withCount(['designations', 'employees'])
            ->orderBy('name');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query->paginate($perPage);
    }

    /**
     * Retrieve a single department by ID with designations.
     */
    public function getById(int $id): Department
    {
        return Department::withCount(['designations', 'employees'])
            ->with('designations')
            ->findOrFail($id);
    }

    /**
     * Create a new department.
     *
     * @param  array{name: string, code: string, description?: string, is_active?: bool}  $data
     *
     * @throws UnauthorizedRoleException
     */
    public function store(User $user, array $data): Department
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        return Department::create($data);
    }

    /**
     * Update an existing department.
     *
     * @param  array{name?: string, code?: string, description?: string, is_active?: bool}  $data
     *
     * @throws UnauthorizedRoleException
     */
    public function update(User $user, Department $department, array $data): Department
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        $department->update($data);

        return $department->fresh()->loadCount(['designations', 'employees']);
    }

    /**
     * Delete a department if no employees or designations are assigned.
     *
     * @throws UnauthorizedRoleException
     * @throws CannotDeleteDepartmentException
     */
    public function destroy(User $user, Department $department): void
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        if ($department->employees()->exists()) {
            throw new CannotDeleteDepartmentException('Cannot delete department because active employees are assigned to it.');
        }

        if ($department->designations()->exists()) {
            throw new CannotDeleteDepartmentException('Cannot delete department because active designations are associated with it.');
        }

        $department->delete();
    }
}


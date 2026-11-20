<?php

namespace App\Services;

use App\Exceptions\Auth\UnauthorizedRoleException;
use App\Exceptions\Organization\CannotDeleteDesignationException;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class DesignationService
{
    /**
     * List designations with optional department and search filters.
     *
     * @param  array{department_id?: int, search?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator|Collection
    {
        $query = Designation::query()
            ->with(['department'])
            ->withCount('employees')
            ->orderBy('title');

        if (! empty($filters['department_id'])) {
            $query->where('department_id', (int) $filters['department_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('title', 'ilike', "%{$search}%");
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) ($filters['per_page'] ?? 20);

        return $query->paginate($perPage);
    }

    /**
     * Retrieve a single designation by ID.
     */
    public function getById(int $id): Designation
    {
        return Designation::with(['department'])
            ->withCount('employees')
            ->findOrFail($id);
    }

    /**
     * Create a new designation.
     *
     * @param  array{department_id: int, title: string, description?: string, is_active?: bool}  $data
     *
     * @throws UnauthorizedRoleException
     */
    public function store(User $user, array $data): Designation
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        return Designation::create($data)->load(['department']);
    }

    /**
     * Update an existing designation.
     *
     * @param  array{department_id?: int, title?: string, description?: string, is_active?: bool}  $data
     *
     * @throws UnauthorizedRoleException
     */
    public function update(User $user, Designation $designation, array $data): Designation
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        $designation->update($data);

        return $designation->fresh()->load(['department'])->loadCount('employees');
    }

    /**
     * Delete a designation if no employees are assigned.
     *
     * @throws UnauthorizedRoleException
     * @throws CannotDeleteDesignationException
     */
    public function destroy(User $user, Designation $designation): void
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        if ($designation->employees()->exists()) {
            throw new CannotDeleteDesignationException('Cannot delete designation because active employees are assigned to it.');
        }

        $designation->delete();
    }
}


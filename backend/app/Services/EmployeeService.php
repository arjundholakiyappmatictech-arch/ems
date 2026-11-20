<?php

namespace App\Services;

use App\Exceptions\Auth\UnauthorizedRoleException;
use App\Exceptions\Employee\InvalidReportingHierarchyException;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class EmployeeService
{
    /**
     * List employees with search and department filtering.
     *
     * @param  array{department_id?: int, status?: string, search?: string, per_page?: int}  $filters
     */
    public function list(User $user, array $filters = []): LengthAwarePaginator|Collection
    {
        $query = Employee::query()
            ->with(['department', 'designation', 'manager', 'user'])
            ->orderBy('id', 'desc');

        if (! empty($filters['department_id'])) {
            $query->where('department_id', (int) $filters['department_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('employee_code', 'ilike', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('email', 'ilike', "%{$search}%");
                    });
            });
        }

        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query->paginate($perPage);
    }

    /**
     * Retrieve single employee with all related entities.
     */
    public function getById(int $id): Employee
    {
        return Employee::with(['department', 'designation', 'manager', 'user', 'directReports'])
            ->findOrFail($id);
    }

    /**
     * Atomic onboarding: provision User credentials and Employee profile.
     * Note: Controllers manage the database transaction lifecycle.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws UnauthorizedRoleException
     */
    public function store(User $user, array $data): Employee
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        // 1. Provision User credentials
        $account = User::create([
            'name' => trim("{$data['first_name']} {$data['last_name']}"),
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'employee',
            'is_active' => true,
        ]);

        // 2. Generate sequential business employee code (e.g. EMP-0001)
        $latestId = (int) (Employee::max('id') ?? 0) + 1;
        $employeeCode = 'EMP-' . str_pad((string) $latestId, 4, '0', STR_PAD_LEFT);

        // 3. Provision Employee record linked to user account
        $employee = Employee::create([
            'user_id' => $account->id,
            'employee_code' => $employeeCode,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'joining_date' => $data['joining_date'],
            'department_id' => $data['department_id'],
            'designation_id' => $data['designation_id'],
            'manager_id' => $data['manager_id'] ?? null,
            'salary' => $data['salary'] ?? 0.00,
            'status' => $data['status'] ?? 'probation',
        ]);

        return $employee->load(['department', 'designation', 'manager', 'user']);
    }

    /**
     * Update employee demographic and job profile.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws UnauthorizedRoleException
     * @throws InvalidReportingHierarchyException
     */
    public function update(User $user, Employee $employee, array $data): Employee
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        // Hierarchy cycle check: cannot manage oneself
        if (isset($data['manager_id']) && (int) $data['manager_id'] === $employee->id) {
            throw new InvalidReportingHierarchyException;
        }

        // Keep linked user's name updated if employee name changes
        if (isset($data['first_name']) || isset($data['last_name'])) {
            $firstName = $data['first_name'] ?? $employee->first_name;
            $lastName = $data['last_name'] ?? $employee->last_name;
            $employee->user()->update([
                'name' => trim("{$firstName} {$lastName}"),
            ]);
        }

        $employee->update($data);

        return $employee->fresh()->load(['department', 'designation', 'manager', 'user']);
    }

    /**
     * Transition employee lifecycle status.
     * If terminated, automatically deactivates the user account and revokes active tokens.
     *
     * @throws UnauthorizedRoleException
     */
    public function updateStatus(User $user, Employee $employee, string $status, ?string $reason = null): Employee
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        if ($status === 'terminated') {
            $employee->user()->update(['is_active' => false]);
            $employee->user->tokens()->delete();
        } elseif ($employee->status === 'terminated' && in_array($status, ['active', 'probation'], true)) {
            $employee->user()->update(['is_active' => true]);
        }

        $employee->update([
            'status' => $status,
        ]);

        return $employee->fresh()->load(['department', 'designation', 'manager', 'user']);
    }

    /**
     * Delete employee record and linked account.
     *
     * @throws UnauthorizedRoleException
     */
    public function destroy(User $user, Employee $employee): void
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        $linkedUser = $employee->user;
        $employee->delete();
        $linkedUser?->delete();
    }
}


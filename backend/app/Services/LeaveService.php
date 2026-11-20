<?php

namespace App\Services;

use App\Exceptions\Attendance\NoEmployeeProfileException;
use App\Exceptions\Auth\UnauthorizedRoleException;
use App\Exceptions\Leave\CannotApproveOwnLeaveException;
use App\Exceptions\Leave\CannotDeleteLeaveTypeException;
use App\Exceptions\Leave\InsufficientLeaveBalanceException;
use App\Exceptions\Leave\InvalidLeaveStateTransitionException;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class LeaveService
{
    // ==========================================
    // 1. LEAVE TYPES CONFIGURATION
    // ==========================================

    /**
     * List all active leave types.
     */
    public function listTypes(array $filters = []): Collection
    {
        $query = LeaveType::query()
            ->withCount('leaveRequests')
            ->orderBy('name');

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->get();
    }

    public function getTypeById(int $id): LeaveType
    {
        return LeaveType::withCount('leaveRequests')->findOrFail($id);
    }

    public function storeType(User $user, array $data): LeaveType
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        return LeaveType::create($data);
    }

    public function updateType(User $user, LeaveType $leaveType, array $data): LeaveType
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        $leaveType->update($data);

        return $leaveType->fresh();
    }

    public function destroyType(User $user, LeaveType $leaveType): void
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        if ($leaveType->leaveRequests()->exists()) {
            throw new CannotDeleteLeaveTypeException;
        }

        $leaveType->delete();
    }

    // ==========================================
    // 2. LEAVE REQUESTS STATE MACHINE
    // ==========================================

    /**
     * Submit a new leave request.
     *
     * @param  array{leave_type_id: int, start_date: string, end_date: string, reason: string}  $data
     *
     * @throws NoEmployeeProfileException
     * @throws InsufficientLeaveBalanceException
     */
    public function storeRequest(User $user, array $data): LeaveRequest
    {
        $employee = $user->employee;
        if (! $employee) {
            throw new NoEmployeeProfileException;
        }

        $leaveType = LeaveType::findOrFail($data['leave_type_id']);

        $startDate = Carbon::parse($data['start_date']);
        $endDate = Carbon::parse($data['end_date']);
        $totalDays = $startDate->diffInDays($endDate) + 1;

        // Quota Balance Validation: sum approved leave days in current calendar year
        $year = $startDate->year;
        $approvedDaysThisYear = (float) LeaveRequest::where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->sum('total_days');

        if (($approvedDaysThisYear + $totalDays) > $leaveType->days_per_year) {
            throw new InsufficientLeaveBalanceException;
        }

        return LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'total_days' => $totalDays,
            'reason' => $data['reason'],
            'status' => 'pending',
        ])->load(['employee', 'leaveType']);
    }

    /**
     * Approve a pending leave request.
     *
     * @throws UnauthorizedRoleException
     * @throws CannotApproveOwnLeaveException
     * @throws InvalidLeaveStateTransitionException
     */
    public function approveRequest(User $user, LeaveRequest $request): LeaveRequest
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        if ($request->employee?->user_id === $user->id) {
            throw new CannotApproveOwnLeaveException;
        }

        if ($request->status !== 'pending') {
            throw new InvalidLeaveStateTransitionException;
        }

        // Concurrency lock on the leave request record
        $lockedRequest = LeaveRequest::where('id', $request->id)->lockForUpdate()->firstOrFail();

        $lockedRequest->update([
            'status' => 'approved',
            'actioned_by' => $user->id,
            'actioned_at' => Carbon::now(),
        ]);

        return $lockedRequest->fresh()->load(['employee', 'leaveType', 'actionedByUser']);
    }

    /**
     * Reject a pending leave request with a mandatory reason.
     *
     * @throws UnauthorizedRoleException
     * @throws CannotApproveOwnLeaveException
     * @throws InvalidLeaveStateTransitionException
     */
    public function rejectRequest(User $user, LeaveRequest $request, string $actionReason): LeaveRequest
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        if ($request->employee?->user_id === $user->id) {
            throw new CannotApproveOwnLeaveException;
        }

        if ($request->status !== 'pending') {
            throw new InvalidLeaveStateTransitionException;
        }

        $lockedRequest = LeaveRequest::where('id', $request->id)->lockForUpdate()->firstOrFail();

        $lockedRequest->update([
            'status' => 'rejected',
            'action_reason' => $actionReason,
            'actioned_by' => $user->id,
            'actioned_at' => Carbon::now(),
        ]);

        return $lockedRequest->fresh()->load(['employee', 'leaveType', 'actionedByUser']);
    }

    /**
     * Cancel a pending leave request by the owning employee.
     *
     * @throws UnauthorizedRoleException
     * @throws InvalidLeaveStateTransitionException
     */
    public function cancelRequest(User $user, LeaveRequest $request): LeaveRequest
    {
        if ($request->employee?->user_id !== $user->id) {
            throw new UnauthorizedRoleException('You can only cancel your own leave requests.');
        }

        if ($request->status !== 'pending') {
            throw new InvalidLeaveStateTransitionException;
        }

        $request->update([
            'status' => 'cancelled',
        ]);

        return $request->fresh()->load(['employee', 'leaveType']);
    }

    /**
     * List leave requests with role-based scoping.
     *
     * @param  array{employee_id?: int, status?: string, per_page?: int}  $filters
     */
    public function listRequests(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = LeaveRequest::query()
            ->with(['employee.department', 'leaveType', 'actionedByUser'])
            ->orderBy('id', 'desc');

        if ($user->isEmployee()) {
            $employeeId = $user->employee?->id ?? 0;
            $query->where('employee_id', $employeeId);
        } elseif (! empty($filters['employee_id'])) {
            $query->where('employee_id', (int) $filters['employee_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query->paginate($perPage);
    }

    public function getRequestById(User $user, int $id): LeaveRequest
    {
        $request = LeaveRequest::with(['employee.department', 'leaveType', 'actionedByUser'])
            ->findOrFail($id);

        if ($user->isEmployee() && $request->employee?->user_id !== $user->id) {
            throw new UnauthorizedRoleException('You do not have permission to inspect this leave request.');
        }

        return $request;
    }
}


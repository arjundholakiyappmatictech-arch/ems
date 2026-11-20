<?php

namespace App\Services;

use App\Exceptions\Attendance\NoEmployeeProfileException;
use App\Exceptions\Auth\UnauthorizedRoleException;
use App\Exceptions\Report\CannotReviewOwnReportException;
use App\Exceptions\Report\CannotUpdateDailyReportException;
use App\Exceptions\Report\DuplicateDailyReportException;
use App\Models\Attendance;
use App\Models\DailyReport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DailyReportService
{
    /**
     * Submit today's daily work report.
     * Strictly 1 report per employee per calendar date.
     *
     * @param  array{tasks_completed: string, blockers?: string, next_plan?: string}  $data
     *
     * @throws NoEmployeeProfileException
     * @throws DuplicateDailyReportException
     */
    public function store(User $user, array $data): DailyReport
    {
        $employee = $user->employee;
        if (! $employee) {
            throw new NoEmployeeProfileException;
        }

        $today = Carbon::today()->toDateString();

        $existing = DailyReport::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            throw new DuplicateDailyReportException;
        }

        // Auto-link to today's attendance record if exists
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        return DailyReport::create([
            'employee_id' => $employee->id,
            'attendance_id' => $todayAttendance?->id,
            'date' => $today,
            'tasks_completed' => $data['tasks_completed'],
            'blockers' => $data['blockers'] ?? null,
            'next_plan' => $data['next_plan'] ?? null,
            'status' => 'submitted',
        ])->load(['employee', 'attendance']);
    }

    /**
     * Update an existing daily work report.
     * Allowed only for the owning employee on the same calendar day before review.
     *
     * @param  array{tasks_completed?: string, blockers?: string, next_plan?: string}  $data
     *
     * @throws CannotUpdateDailyReportException
     */
    public function update(User $user, DailyReport $report, array $data): DailyReport
    {
        $employee = $user->employee;
        $today = Carbon::today()->toDateString();

        if (! $employee || $report->employee_id !== $employee->id) {
            throw new CannotUpdateDailyReportException('You cannot edit a report belonging to another employee.');
        }

        if ($report->status === 'reviewed') {
            throw new CannotUpdateDailyReportException('This report has already been reviewed by a manager and cannot be edited.');
        }

        if ($report->date->toDateString() !== $today) {
            throw new CannotUpdateDailyReportException('Reports can only be updated on the day they were created.');
        }

        $report->update($data);

        return $report->fresh()->load(['employee', 'attendance']);
    }

    /**
     * Manager reviews a daily work report and attaches feedback remarks.
     *
     * @throws UnauthorizedRoleException
     * @throws CannotReviewOwnReportException
     */
    public function review(User $user, DailyReport $report, string $managerRemarks): DailyReport
    {
        if (! $user->isManager()) {
            throw new UnauthorizedRoleException;
        }

        $employee = $report->employee;

        // Manager cannot review their own submitted daily report
        if ($employee?->user_id === $user->id) {
            throw new CannotReviewOwnReportException;
        }

        // Direct Manager Review Enforcement:
        // If employee has an assigned direct manager, only that manager can review the report.
        $managerEmployeeId = $user->employee?->id;
        if ($employee?->manager_id && $employee->manager_id !== $managerEmployeeId) {
            throw new UnauthorizedRoleException("Only the employee's assigned direct manager can review this report.");
        }

        $report->update([
            'status' => 'reviewed',
            'manager_remarks' => $managerRemarks,
            'reviewed_by' => $user->id,
            'reviewed_at' => Carbon::now(),
        ]);

        return $report->fresh()->load(['employee', 'reviewer', 'attendance']);
    }

    /**
     * Retrieve single daily report with relationships.
     */
    public function getById(User $user, int $id): DailyReport
    {
        $report = DailyReport::with(['employee.department', 'employee.designation', 'reviewer', 'attendance'])
            ->findOrFail($id);

        // Access scoping
        if ($user->isEmployee() && $report->employee?->user_id !== $user->id) {
            throw new UnauthorizedRoleException('You do not have permission to view this report.');
        }

        return $report;
    }

    /**
     * List daily work reports feed.
     *
     * @param  array{employee_id?: int, department_id?: int, date?: string, status?: string, per_page?: int}  $filters
     */
    public function list(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = DailyReport::query()
            ->with(['employee.department', 'employee.designation', 'reviewer'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc');

        if ($user->isEmployee()) {
            $employeeId = $user->employee?->id ?? 0;
            $query->where('employee_id', $employeeId);
        } elseif (! empty($filters['employee_id'])) {
            $query->where('employee_id', (int) $filters['employee_id']);
        }

        if (! empty($filters['department_id'])) {
            $query->whereHas('employee', function ($eq) use ($filters) {
                $eq->where('department_id', (int) $filters['department_id']);
            });
        }

        if (! empty($filters['date'])) {
            $query->where('date', $filters['date']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query->paginate($perPage);
    }
}


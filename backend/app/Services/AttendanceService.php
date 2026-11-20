<?php

namespace App\Services;

use App\Exceptions\Attendance\AlreadyClockedInException;
use App\Exceptions\Attendance\InvalidClockOutException;
use App\Exceptions\Attendance\NoEmployeeProfileException;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AttendanceService
{
    /**
     * Clock in for the current working day.
     *
     * @param  array{notes?: string}  $data
     *
     * @throws NoEmployeeProfileException
     * @throws AlreadyClockedInException
     */
    public function clockIn(User $user, array $data = []): Attendance
    {
        $employee = $user->employee;
        if (! $employee) {
            throw new NoEmployeeProfileException;
        }

        $today = Carbon::today()->toDateString();

        $existing = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            throw new AlreadyClockedInException;
        }

        return Attendance::create([
            'employee_id' => $employee->id,
            'date' => $today,
            'clock_in' => Carbon::now(),
            'status' => 'present',
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Clock out for the current working day and compute total hours.
     *
     * @param  array{notes?: string}  $data
     *
     * @throws NoEmployeeProfileException
     * @throws InvalidClockOutException
     */
    public function clockOut(User $user, array $data = []): Attendance
    {
        $employee = $user->employee;
        if (! $employee) {
            throw new NoEmployeeProfileException;
        }

        $today = Carbon::today()->toDateString();

        // Concurrency protection: lock record during clock-out computation
        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->lockForUpdate()
            ->first();

        if (! $attendance || $attendance->clock_out !== null) {
            throw new InvalidClockOutException;
        }

        $now = Carbon::now();
        $clockIn = Carbon::parse($attendance->clock_in);
        $totalHours = round($clockIn->diffInMinutes($now) / 60, 2);

        // If worked less than 4 hours, mark as half day
        $status = $totalHours < 4.0 ? 'half_day' : 'present';

        $notes = $attendance->notes;
        if (! empty($data['notes'])) {
            $notes = $notes ? "{$notes} | Checkout note: {$data['notes']}" : $data['notes'];
        }

        $attendance->update([
            'clock_out' => $now,
            'total_hours' => $totalHours,
            'status' => $status,
            'notes' => $notes,
        ]);

        return $attendance->fresh();
    }

    /**
     * Retrieve live punch state for the current day.
     *
     * @return array{is_clocked_in: bool, is_clocked_out: bool, attendance: Attendance|null}
     */
    public function getTodayStatus(User $user): array
    {
        $employee = $user->employee;
        if (! $employee) {
            return [
                'is_clocked_in' => false,
                'is_clocked_out' => false,
                'attendance' => null,
            ];
        }

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        return [
            'is_clocked_in' => $attendance !== null,
            'is_clocked_out' => $attendance?->clock_out !== null,
            'attendance' => $attendance,
        ];
    }

    /**
     * List paginated attendance records with scoping.
     *
     * @param  array{employee_id?: int, department_id?: int, date?: string, month?: int, year?: int, per_page?: int}  $filters
     */
    public function list(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Attendance::query()
            ->with(['employee.department', 'employee.designation'])
            ->orderBy('date', 'desc')
            ->orderBy('clock_in', 'desc');

        // Scoping: non-managers only see their own attendance
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

        if (! empty($filters['month'])) {
            $query->whereMonth('date', (int) $filters['month']);
        }

        if (! empty($filters['year'])) {
            $query->whereYear('date', (int) $filters['year']);
        }

        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query->paginate($perPage);
    }
}


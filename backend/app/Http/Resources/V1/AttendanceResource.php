<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Attendance
 */
class AttendanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date?->format('Y-m-d'),
            'clock_in' => $this->clock_in?->format('H:i:s'),
            'clock_out' => $this->clock_out?->format('H:i:s'),
            'total_hours' => $this->total_hours,
            'status' => $this->status,
            'notes' => $this->notes,
            'employee' => $this->whenLoaded('employee', function () {
                return $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => "{$this->employee->first_name} {$this->employee->last_name}",
                    'code' => $this->employee->employee_code,
                ] : null;
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

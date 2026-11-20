<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\LeaveRequest
 */
class LeaveRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'total_days' => $this->total_days,
            'reason' => $this->reason,
            'status' => $this->status,
            'action_reason' => $this->action_reason,
            'leave_type' => $this->whenLoaded('leaveType', function () {
                return $this->leaveType ? [
                    'id' => $this->leaveType->id,
                    'name' => $this->leaveType->name,
                ] : null;
            }),
            'employee' => $this->whenLoaded('employee', function () {
                return $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => "{$this->employee->first_name} {$this->employee->last_name}",
                    'code' => $this->employee->employee_code,
                    'manager_id' => $this->employee->manager_id,
                ] : null;
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

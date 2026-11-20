<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\DailyReport
 */
class DailyReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date?->format('Y-m-d'),
            'tasks_completed' => $this->tasks_completed,
            'blockers' => $this->blockers,
            'next_plan' => $this->next_plan,
            'status' => $this->status,
            'manager_remarks' => $this->manager_remarks,
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

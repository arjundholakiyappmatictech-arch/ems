<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Employee
 */
class EmployeeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $actingUser = $request->user();
        $canViewSensitiveCompensation = $actingUser && ($actingUser->isManager() || $actingUser->id === $this->user_id);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'employee_code' => $this->employee_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'joining_date' => $this->joining_date->format('Y-m-d'),
            'department_id' => $this->department_id,
            'designation_id' => $this->designation_id,
            'manager_id' => $this->manager_id,
            'salary' => $this->when($canViewSensitiveCompensation, $this->salary),
            'status' => $this->status,
            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                    'code' => $this->department->code,
                ];
            }),
            'designation' => $this->whenLoaded('designation', function () {
                return [
                    'id' => $this->designation->id,
                    'title' => $this->designation->title,
                ];
            }),
            'manager' => $this->whenLoaded('manager', function () {
                return [
                    'id' => $this->manager->id,
                    'employee_code' => $this->manager->employee_code,
                    'full_name' => $this->manager->full_name,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'email' => $this->user->email,
                    'role' => $this->user->role,
                    'is_active' => $this->user->is_active,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

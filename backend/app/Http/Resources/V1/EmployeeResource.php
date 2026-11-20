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
        return [
            'id' => $this->id,
            'employee_code' => $this->employee_code,
            'phone' => $this->phone,
            'joining_date' => $this->joining_date?->format('Y-m-d'),
            'status' => $this->status,
            'department' => $this->when($this->relationLoaded('department') && $this->department, function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ];
            }),
            'designation' => $this->when($this->relationLoaded('designation') && $this->designation, function () {
                return [
                    'id' => $this->designation->id,
                    'title' => $this->designation->title,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'role' => $this->user->role,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

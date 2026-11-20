<?php

namespace App\Http\Requests\V1\DailyReport;

use Illuminate\Foundation\Http\FormRequest;

class StoreDailyReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'tasks_completed' => ['required', 'string'],
            'blockers' => ['nullable', 'string'],
            'next_plan' => ['nullable', 'string'],
        ];
    }
}


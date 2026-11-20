<?php

namespace App\Http\Requests\V1\DailyReport;

use Illuminate\Foundation\Http\FormRequest;

class ReviewDailyReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManager() ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'manager_remarks' => ['required', 'string', 'max:2000'],
        ];
    }
}


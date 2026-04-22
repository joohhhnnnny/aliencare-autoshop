<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Report;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for analytics date-range endpoints.
 */
class GetAnalyticsDateRangeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date_format:Y-m-d', 'required_with:end_date', 'before_or_equal:end_date'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'required_with:start_date', 'after_or_equal:start_date', 'before_or_equal:today'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'start_date.date_format' => 'Start date must be in YYYY-MM-DD format.',
            'start_date.required_with' => 'Start date is required when end date is provided.',
            'start_date.before_or_equal' => 'Start date must be before or equal to end date.',
            'end_date.date_format' => 'End date must be in YYYY-MM-DD format.',
            'end_date.required_with' => 'End date is required when start date is provided.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'end_date.before_or_equal' => 'End date cannot be in the future.',
        ];
    }
}

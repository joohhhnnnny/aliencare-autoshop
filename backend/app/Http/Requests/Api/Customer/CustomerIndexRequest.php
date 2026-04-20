<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Customer;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class CustomerIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()?->role;

        return $role === UserRole::Admin
            || $role === UserRole::FrontDesk
            || $role === UserRole::Admin->value
            || $role === UserRole::FrontDesk->value;
    }

    public function rules(): array
    {
        return [
            'account_status' => ['sometimes', 'string', 'in:pending,approved,rejected,deleted'],
            'segment' => ['sometimes', 'string', 'in:all,active,inactive,pending'],
            'tier' => ['sometimes', 'string', 'in:vip,fleet'],
            'search' => ['sometimes', 'string', 'max:150'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}

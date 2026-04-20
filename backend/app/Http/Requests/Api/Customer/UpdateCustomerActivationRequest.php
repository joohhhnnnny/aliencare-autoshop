<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Customer;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerActivationRequest extends FormRequest
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
            'is_active' => ['required', 'boolean'],
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Customer;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerTiersRequest extends FormRequest
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
            'tier_mode' => ['required', 'string', 'in:auto,manual'],
            'tier_overrides' => ['nullable', 'array', 'required_if:tier_mode,manual'],
            'tier_overrides.*' => ['string', 'in:VIP,Fleet', 'distinct'],
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Customer;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $customerId = $this->route('id');
        $customer = $customerId ? Customer::find($customerId) : null;
        $linkedUserId = null;

        if ($customer?->email) {
            $linkedUserId = User::where('email', $customer->email)->value('id');
        }

        $userEmailRule = Rule::unique('users', 'email');

        if ($linkedUserId) {
            $userEmailRule->ignore($linkedUserId);
        }

        return [
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customerId), $userEmailRule],
            'phone_number' => ['sometimes', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'preferred_contact_method' => ['sometimes', 'nullable', 'string', 'in:sms,call,email'],
            'special_notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}

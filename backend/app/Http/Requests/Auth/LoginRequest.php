<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Models\Customer;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $this->ensureCustomerIsActive();

        RateLimiter::clear($this->throttleKey());
    }

    private function ensureCustomerIsActive(): void
    {
        $user = $this->user();

        if (! $user) {
            return;
        }

        if (! in_array($user->role, [UserRole::Customer, UserRole::Customer->value], true)) {
            return;
        }

        $customer = Customer::withTrashed()->where('email', $user->email)->first();

        if (! $customer) {
            return;
        }

        $status = $customer->account_status instanceof AccountStatus
            ? $customer->account_status->value
            : (string) $customer->account_status;

        $isActive = (bool) ($customer->is_active ?? true);

        if ($customer->trashed() || ! $isActive || $status === AccountStatus::Deleted->value) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'This customer account is deactivated. Please contact the front desk.',
            ]);
        }
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return $this->string('email')
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}

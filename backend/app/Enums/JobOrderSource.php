<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Canonical source for job order origin.
 */
enum JobOrderSource: string
{
    case OnlineBooking = 'online_booking';
    case WalkIn = 'walk_in';

    /**
     * Human-readable label for API/UI responses.
     */
    public function label(): string
    {
        return match ($this) {
            self::OnlineBooking => 'Online Booking',
            self::WalkIn => 'Walk-in',
        };
    }
}

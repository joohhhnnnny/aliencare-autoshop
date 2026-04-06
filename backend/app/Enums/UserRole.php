<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case FrontDesk = 'frontdesk';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::FrontDesk => 'Front Desk',
            self::Customer => 'Customer',
        };
    }
}

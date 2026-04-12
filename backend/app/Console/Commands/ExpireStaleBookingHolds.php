<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\CustomerTransactionType;
use App\Enums\JobOrderStatus;
use App\Models\JobOrder;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class ExpireStaleBookingHolds extends Command
{
    protected $signature = 'booking:expire-stale-holds {--dry-run : Show how many records would be expired without updating}';

    protected $description = 'Cancel stale unpaid booking holds so arrival-slot capacity is released.';

    public function handle(): int
    {
        $expiredQuery = JobOrder::query()
            ->whereIn('status', [
                JobOrderStatus::Created->value,
                JobOrderStatus::PendingApproval->value,
            ])
            ->whereNotNull('reservation_expires_at')
            ->where('reservation_expires_at', '<=', now())
            ->whereDoesntHave('customerTransactions', function (Builder $query): void {
                $query->whereIn('type', [
                    CustomerTransactionType::Invoice->value,
                    CustomerTransactionType::ReservationFee->value,
                ])->where('xendit_status', 'PAID');
            });

        $count = (clone $expiredQuery)->count();

        if ($count === 0) {
            $this->info('No stale booking holds found.');

            return self::SUCCESS;
        }

        if ((bool) $this->option('dry-run')) {
            $this->info("{$count} stale booking hold(s) would be expired.");

            return self::SUCCESS;
        }

        $updated = $expiredQuery->update([
            'status' => JobOrderStatus::Cancelled->value,
            'reservation_expires_at' => null,
            'updated_at' => now(),
        ]);

        $this->info("Expired {$updated} stale booking hold(s).");

        return self::SUCCESS;
    }
}

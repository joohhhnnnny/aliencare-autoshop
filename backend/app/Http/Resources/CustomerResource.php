<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\AccountStatus;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusValue = $this->statusValue();
        $isActiveFlag = (bool) ($this->is_active ?? true);
        $uiStatus = $statusValue === AccountStatus::Approved->value && $isActiveFlag ? 'Active' : 'Inactive';

        $vehiclesCount = $this->resolveVehiclesCount();
        $primaryVehicle = $this->resolvePrimaryVehicle();
        $totalSpent = $this->resolveTotalSpent();
        $autoTiers = $this->resolveAutoTiers($totalSpent, $vehiclesCount);

        return [
            'id' => $this->id,
            'code' => sprintf('CUS-%08d', (int) $this->id),
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'address' => $this->address,
            'license_number' => $this->license_number,
            'preferred_contact_method' => $this->preferred_contact_method,
            'special_notes' => $this->special_notes,
            'onboarding_completed_at' => $this->onboarding_completed_at?->toISOString(),
            'account_status' => $statusValue,
            'is_active' => $isActiveFlag,
            'status' => $uiStatus,
            'ui_status' => $uiStatus,
            'tier_mode' => $this->resolveTierMode(),
            'tier_overrides' => $this->resolveTierOverrides(),
            'auto_tiers' => $autoTiers,
            'tiers' => $this->resolveEffectiveTiers($autoTiers),
            'approved_by' => $this->when($this->relationLoaded('approvedBy') && $this->approvedBy, [
                'id' => $this->approvedBy?->id,
                'name' => $this->approvedBy?->name,
            ]),
            'approved_at' => $this->approved_at?->toISOString(),
            'rejection_reason' => $this->rejection_reason,
            'vehicles_count' => $vehiclesCount,
            'primary_vehicle' => $primaryVehicle,
            'extra_vehicles' => max($vehiclesCount - ($primaryVehicle ? 1 : 0), 0),
            'total_jobs' => $this->resolveTotalJobs(),
            'total_spent' => $totalSpent,
            'last_visit_at' => $this->toIsoString($this->last_visit_at),
            'customer_since' => $this->created_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'vehicles' => VehicleResource::collection($this->whenLoaded('vehicles')),
        ];
    }

    private function statusValue(): string
    {
        if ($this->account_status instanceof AccountStatus) {
            return $this->account_status->value;
        }

        return (string) $this->account_status;
    }

    private function resolveTierMode(): string
    {
        $mode = strtolower((string) ($this->tier_mode ?? 'auto'));

        return in_array($mode, ['auto', 'manual'], true) ? $mode : 'auto';
    }

    /**
     * @return array<int, string>
     */
    private function resolveTierOverrides(): array
    {
        $overrides = $this->tier_overrides;

        if (! is_array($overrides)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(
            static function (mixed $tier): ?string {
                $normalized = strtoupper(trim((string) $tier));

                return match ($normalized) {
                    'VIP' => 'VIP',
                    'FLEET' => 'Fleet',
                    default => null,
                };
            },
            $overrides,
        ))));
    }

    private function resolveVehiclesCount(): int
    {
        if ($this->vehicles_count !== null) {
            return (int) $this->vehicles_count;
        }

        if ($this->relationLoaded('vehicles')) {
            return $this->vehicles->count();
        }

        return 0;
    }

    private function resolvePrimaryVehicle(): ?string
    {
        $make = (string) ($this->primary_vehicle_make ?? '');
        $model = (string) ($this->primary_vehicle_model ?? '');
        $plate = (string) ($this->primary_vehicle_plate ?? '');

        if ($make !== '' || $model !== '' || $plate !== '') {
            return trim(sprintf('%s · %s', trim("{$make} {$model}"), $plate));
        }

        if ($this->relationLoaded('vehicles') && $this->vehicles->isNotEmpty()) {
            $vehicle = $this->vehicles->first();

            return trim(sprintf('%s · %s', trim("{$vehicle->make} {$vehicle->model}"), $vehicle->plate_number));
        }

        return null;
    }

    private function resolveTotalJobs(): int
    {
        return (int) ($this->total_jobs ?? 0);
    }

    private function resolveTotalSpent(): float
    {
        return (float) ($this->total_spent ?? 0);
    }

    /**
     * @return array<int, string>
     */
    private function resolveAutoTiers(float $totalSpent, int $vehiclesCount): array
    {
        $tiers = [];

        if ($totalSpent >= 50000) {
            $tiers[] = 'VIP';
        }

        if ($vehiclesCount >= 2) {
            $tiers[] = 'Fleet';
        }

        return $tiers;
    }

    /**
     * @param  array<int, string>  $autoTiers
     * @return array<int, string>
     */
    private function resolveEffectiveTiers(array $autoTiers): array
    {
        if ($this->resolveTierMode() === 'manual') {
            return $this->resolveTierOverrides();
        }

        return $autoTiers;
    }

    private function toIsoString(mixed $value): ?string
    {
        if ($value instanceof CarbonInterface) {
            return $value->toISOString();
        }

        if ($value === null) {
            return null;
        }

        try {
            return Carbon::parse((string) $value)->toISOString();
        } catch (\Throwable) {
            return null;
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'plate_number' => $this->plate_number,
            'make' => $this->make,
            'model' => $this->model,
            'year' => $this->year,
            'color' => $this->color,
            'vin' => $this->vin,
            'approval_status' => $this->approval_status,
            'approved_by' => $this->when($this->relationLoaded('approvedBy') && $this->approvedBy, [
                'id' => $this->approvedBy?->id,
                'name' => $this->approvedBy?->name,
            ]),
            'approved_at' => $this->approved_at?->toISOString(),
            'last_service_at' => $this->toIsoString($this->last_service_at),
            'next_due_at' => null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'customer' => new CustomerResource($this->whenLoaded('customer')),
        ];
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

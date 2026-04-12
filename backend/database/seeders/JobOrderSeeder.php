<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Bay;
use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\JobOrderItem;
use App\Models\Mechanic;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class JobOrderSeeder extends Seeder
{
    public function run(): void
    {
        // Keep baseline bays deterministic so db:seed can be rerun safely.
        $bays = collect([
            'Bay 1' => ['status' => 'available'],
            'Bay 2' => ['status' => 'available'],
            'Bay 3' => ['status' => 'available'],
            'Bay 4' => ['status' => 'maintenance'],
        ])->map(fn (array $attributes, string $name): Bay => Bay::updateOrCreate(['name' => $name], $attributes));

        // Keep mechanic accounts deterministic to avoid unique email collisions on reruns.
        $mechanics = collect([
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan@example.com',
                'specialization' => 'Engine',
            ],
            [
                'name' => 'Pedro Santos',
                'email' => 'pedro@example.com',
                'specialization' => 'Transmission',
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria@example.com',
                'specialization' => 'Electrical',
            ],
        ])->mapWithKeys(function (array $mechanicData): array {
            $user = User::updateOrCreate(
                ['email' => $mechanicData['email']],
                [
                    'name' => $mechanicData['name'],
                    'password' => 'AlienCare123!',
                ],
            );

            $mechanic = Mechanic::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'specialization' => $mechanicData['specialization'],
                    'availability_status' => 'available',
                ],
            );

            return [$mechanicData['email'] => $mechanic];
        });

        // Create customers with vehicles
        $customers = Customer::factory(5)->create()->each(function (Customer $customer) {
            Vehicle::factory(rand(1, 3))->create(['customer_id' => $customer->id]);
        });

        // Create job orders in various statuses
        $approver = User::first();

        // Created JOs
        JobOrder::factory(2)->create([
            'customer_id' => $customers->random()->id,
            'vehicle_id' => fn () => Vehicle::inRandomOrder()->first()->id,
        ])->each(fn (JobOrder $jo) => JobOrderItem::factory(rand(1, 3))->create(['job_order_id' => $jo->id]));

        // Approved JOs
        JobOrder::factory(2)->approved()->create([
            'customer_id' => $customers->random()->id,
            'vehicle_id' => fn () => Vehicle::inRandomOrder()->first()->id,
            'approved_by' => $approver->id,
        ])->each(fn (JobOrder $jo) => JobOrderItem::factory(rand(1, 3))->create(['job_order_id' => $jo->id]));

        // In Progress JO
        $inProgressJo = JobOrder::factory()->inProgress()->create([
            'customer_id' => $customers->random()->id,
            'vehicle_id' => fn () => Vehicle::inRandomOrder()->first()->id,
            'approved_by' => $approver->id,
            'assigned_mechanic_id' => $mechanics['juan@example.com']->id,
            'bay_id' => $bays['Bay 1']->id,
        ]);
        $bays['Bay 1']->update(['status' => 'occupied']);
        $mechanics['juan@example.com']->update(['availability_status' => 'busy']);
        JobOrderItem::factory(3)->create(['job_order_id' => $inProgressJo->id]);

        // Completed JOs
        JobOrder::factory(2)->completed()->create([
            'customer_id' => $customers->random()->id,
            'vehicle_id' => fn () => Vehicle::inRandomOrder()->first()->id,
            'approved_by' => $approver->id,
            'assigned_mechanic_id' => $mechanics['pedro@example.com']->id,
        ])->each(fn (JobOrder $jo) => JobOrderItem::factory(rand(2, 4))->create(['job_order_id' => $jo->id]));

        // Settled JOs
        JobOrder::factory(3)->settled()->create([
            'customer_id' => $customers->random()->id,
            'vehicle_id' => fn () => Vehicle::inRandomOrder()->first()->id,
            'approved_by' => $approver->id,
            'assigned_mechanic_id' => $mechanics['maria@example.com']->id,
        ])->each(fn (JobOrder $jo) => JobOrderItem::factory(rand(2, 4))->create(['job_order_id' => $jo->id]));

        // Cancelled JO
        JobOrder::factory()->cancelled()->create([
            'customer_id' => $customers->random()->id,
            'vehicle_id' => fn () => Vehicle::inRandomOrder()->first()->id,
        ]);
    }
}

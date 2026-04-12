<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\CustomerTransaction;
use App\Models\JobOrder;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    private User $customerUser;

    private Customer $customer;

    private Customer $otherCustomer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customerUser = User::factory()->create([
            'role' => 'customer',
        ]);

        $this->customer = Customer::factory()->create([
            'email' => $this->customerUser->email,
        ]);

        $this->otherCustomer = Customer::factory()->create();
    }

    public function test_my_transactions_returns_only_authenticated_customer_transactions(): void
    {
        $ownTransaction = CustomerTransaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'invoice',
            'amount' => 1500,
            'notes' => 'Oil change invoice',
        ]);

        CustomerTransaction::create([
            'customer_id' => $this->otherCustomer->id,
            'type' => 'invoice',
            'amount' => 2300,
            'notes' => 'Other customer invoice',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/v1/customer/transactions?per_page=100');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $transactions = $response->json('data.data');

        $this->assertCount(1, $transactions);
        $this->assertSame($ownTransaction->id, $transactions[0]['id']);
        $this->assertSame($this->customer->id, $transactions[0]['customer_id']);
    }

    public function test_my_job_orders_returns_only_authenticated_customer_job_orders_with_status_fields(): void
    {
        $ownVehicle = Vehicle::factory()->create([
            'customer_id' => $this->customer->id,
        ]);

        $otherVehicle = Vehicle::factory()->create([
            'customer_id' => $this->otherCustomer->id,
        ]);

        $ownJobOrder = JobOrder::factory()->create([
            'customer_id' => $this->customer->id,
            'vehicle_id' => $ownVehicle->id,
            'status' => 'in_progress',
        ]);

        JobOrder::factory()->create([
            'customer_id' => $this->otherCustomer->id,
            'vehicle_id' => $otherVehicle->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/v1/customer/job-orders');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $jobOrders = $response->json('data');

        $this->assertCount(1, $jobOrders);
        $this->assertSame($ownJobOrder->id, $jobOrders[0]['id']);
        $this->assertSame('in_progress', $jobOrders[0]['status']);
        $this->assertSame('In Progress', $jobOrders[0]['status_label']);
        $this->assertSame('orange', $jobOrders[0]['status_color']);
    }

    public function test_customer_cannot_access_other_customer_transactions_by_id_route(): void
    {
        CustomerTransaction::create([
            'customer_id' => $this->otherCustomer->id,
            'type' => 'invoice',
            'amount' => 1800,
            'notes' => 'Restricted invoice',
        ]);

        $this->actingAs($this->customerUser)
            ->getJson("/api/v1/customers/{$this->otherCustomer->id}/transactions")
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'You are not allowed to access this customer.');
    }

    public function test_customer_cannot_access_other_customer_job_orders_by_id_route(): void
    {
        $otherVehicle = Vehicle::factory()->create([
            'customer_id' => $this->otherCustomer->id,
        ]);

        JobOrder::factory()->create([
            'customer_id' => $this->otherCustomer->id,
            'vehicle_id' => $otherVehicle->id,
            'status' => 'approved',
        ]);

        $this->actingAs($this->customerUser)
            ->getJson("/api/v1/customers/{$this->otherCustomer->id}/job-orders")
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'You are not allowed to access this customer.');
    }

    public function test_frontdesk_can_still_access_customer_transactions_by_id_route(): void
    {
        $frontDesk = User::factory()->create([
            'role' => 'frontdesk',
        ]);

        CustomerTransaction::create([
            'customer_id' => $this->otherCustomer->id,
            'type' => 'invoice',
            'amount' => 900,
            'notes' => 'Frontdesk-accessible invoice',
        ]);

        $this->actingAs($frontDesk)
            ->getJson("/api/v1/customers/{$this->otherCustomer->id}/transactions")
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\JobOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Customer\StoreCustomerBookingRequest;
use App\Http\Resources\JobOrderResource;
use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\JobOrderItem;
use App\Models\ServiceCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CustomerBookingController extends Controller
{
    /**
     * Book a service for the authenticated customer.
     * Creates a job order in pending_approval status with the chosen service.
     */
    public function store(StoreCustomerBookingRequest $request): JsonResponse
    {
        $user = $request->user();

        $customer = Customer::where('email', $user->email)->first();

        if (! $customer) {
            return response()->json([
                'success' => false,
                'message' => 'No customer record linked to this account.',
            ], 404);
        }

        $service = ServiceCatalog::active()->find($request->validated('service_id'));

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'The selected service is unavailable.',
            ], 422);
        }

        try {
            $jobOrder = DB::transaction(function () use ($customer, $service, $request) {
                $jobOrder = JobOrder::create([
                    'customer_id'  => $customer->id,
                    'vehicle_id'   => $request->validated('vehicle_id'),
                    'service_id'   => $service->id,
                    'arrival_date' => $request->validated('arrival_date'),
                    'arrival_time' => $request->validated('arrival_time'),
                    'status'       => JobOrderStatus::PendingApproval,
                    'service_fee'  => $service->price_fixed,
                    'notes'        => $request->validated('notes'),
                ]);

                // Add service as a line item on the job order
                JobOrderItem::create([
                    'job_order_id' => $jobOrder->id,
                    'item_type'    => 'service',
                    'item_id'      => null,
                    'description'  => $service->name,
                    'quantity'     => 1,
                    'unit_price'   => $service->price_fixed,
                    'total_price'  => $service->price_fixed,
                ]);

                return $jobOrder->fresh(['customer', 'vehicle', 'service', 'items']);
            });

            return response()->json([
                'success' => true,
                'data'    => new JobOrderResource($jobOrder),
                'message' => 'Booking submitted. Awaiting shop approval.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking: '.$e->getMessage(),
            ], 500);
        }
    }
}

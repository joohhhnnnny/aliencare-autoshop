<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Contracts\Services\AlertServiceInterface;
use App\Events\LowStockAlert;
use App\Models\Report;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class HandleLowStockAlert implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        private AlertServiceInterface $alertService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(LowStockAlert $event): void
    {
        try {
            $inventory = $event->inventory;

            // Delegate alert creation/update to the service for consistent urgency logic
            $this->alertService->handleSingleItemLowStock($inventory);

            // Create low stock alert report
            $alertData = [
                'item_id' => $inventory->item_id,
                'item_name' => $inventory->item_name,
                'category' => $inventory->category,
                'current_stock' => $inventory->stock,
                'reorder_level' => $inventory->reorder_level,
                'supplier' => $inventory->supplier,
                'unit_price' => $inventory->unit_price,
                'alert_level' => $event->alertLevel,
                'estimated_cost_to_reorder' => ($inventory->reorder_level * 2) * $inventory->unit_price,
                'suggested_order_quantity' => $inventory->reorder_level * 2,
                'stock_out_risk' => $inventory->stock == 0 ? 'immediate' : 'high',
            ];

            Report::create([
                'report_type' => 'low_stock_alert',
                'generated_date' => $event->timestamp,
                'report_date' => now()->toDateString(),
                'data_summary' => $alertData,
                'generated_by' => 'System - Auto Alert',
            ]);

            Log::warning('Low stock alert generated', [
                'item_id' => $inventory->item_id,
                'item_name' => $inventory->item_name,
                'current_stock' => $inventory->stock,
                'reorder_level' => $inventory->reorder_level,
                'alert_level' => $event->alertLevel,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle low stock alert: '.$e->getMessage(), [
                'inventory_id' => $event->inventory->inventory_id,
                'alert_level' => $event->alertLevel,
            ]);
        }
    }
}

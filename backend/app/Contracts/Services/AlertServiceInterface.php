<?php

declare(strict_types=1);

namespace App\Contracts\Services;

use App\Models\Alert;
use App\Models\Inventory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

/**
 * Interface for Alert Service operations.
 *
 * Defines the contract for alert management including generating,
 * acknowledging, and cleaning up alerts.
 */
interface AlertServiceInterface
{
    /**
     * Get all alerts with optional filtering.
     *
     * @param array{
     *     type?: string,
     *     urgency?: string,
     *     acknowledged?: bool,
     *     item_id?: string
     * } $filters Optional filters to apply
     * @param  int  $perPage  Number of items per page
     */
    public function getAlerts(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Generate low stock alerts for items below reorder level.
     *
     * @return array{
     *     created: int,
     *     updated: int,
     *     alerts: Collection
     * }
     */
    public function generateLowStockAlerts(): array;

    /**
     * Handle a single low-stock item, creating or updating its alert.
     */
    public function handleSingleItemLowStock(Inventory $item): Alert;

    /**
     * Get alert statistics and summary.
     *
     * @return array{
     *     total_alerts: int,
     *     unacknowledged_alerts: int,
     *     acknowledged_alerts: int,
     *     critical_alerts: int,
     *     high_priority_alerts: int,
     *     alerts_by_urgency: array,
     *     alerts_by_type: array,
     *     recent_alerts: Collection
     * }
     */
    public function getAlertStatistics(): array;

    /**
     * Acknowledge a specific alert.
     *
     * @param  int  $id  Alert ID
     * @param  string  $acknowledgedBy  Identity of who acknowledged
     * @param  string|null  $notes  Optional notes
     *
     * @throws ModelNotFoundException
     */
    public function acknowledgeAlert(int $id, string $acknowledgedBy = 'System', ?string $notes = null): Alert;

    /**
     * Bulk acknowledge multiple alerts.
     *
     * @param  array<int>  $ids  Array of alert IDs
     * @param  string  $acknowledgedBy  Identity of who acknowledged
     * @return array{
     *     acknowledged_count: int,
     *     failed_count: int,
     *     alerts: Collection
     * }
     */
    public function bulkAcknowledgeAlerts(array $ids, string $acknowledgedBy = 'System'): array;

    /**
     * Cleanup old acknowledged alerts.
     *
     * @param  int  $daysOld  Delete alerts older than this many days
     * @return array{
     *     deleted_count: int,
     *     message: string
     * }
     */
    public function cleanupAlerts(int $daysOld = 30): array;

    /**
     * Generate expiry alerts for items expiring soon.
     *
     * @return array{
     *     created: int,
     *     updated: int,
     *     alerts: Collection
     * }
     */
    public function generateExpiryAlerts(): array;

    /**
     * Get daily alert trends for chart display.
     *
     * @return Collection<int, object{date: string, alert_type: string, count: int}>
     */
    public function getAlertTrends(int $days = 30): Collection;
}

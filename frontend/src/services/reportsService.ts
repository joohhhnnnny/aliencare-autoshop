/**
 * Reports API Service
 * Handles all reporting and analytics API calls to Laravel backend
 */

import { Report } from '@/types/inventory';
import { api, ApiResponse, PaginatedResponse } from './api';

export interface ReportFilters {
    report_type?: 'daily_usage' | 'monthly_procurement' | 'reconciliation' | 'low_stock' | 'reservation_summary';
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
}

export interface DailyUsageRequest {
    date: string;
}

export interface MonthlyProcurementRequest {
    year: number;
    month: number;
}

export interface ReconciliationRequest {
    start_date: string;
    end_date: string;
}

export interface ReportsDashboardAnalytics {
    inventory_value: number;
    low_stock_count: number;
    pending_reservations: number;
    today_transactions: number;
    weekly_sales: number;
    monthly_procurement: number;
    job_pipeline: {
        completed: number;
        in_progress: number;
        queued: number;
    };
    total_items?: number;
    total_value?: number;
    active_reservations?: number;
    recent_transactions?: Array<{
        id: number;
        item_id: number;
        transaction_type: string;
        quantity: number;
        created_at: string;
        inventory_item?: {
            item_id: number | null;
            item_name: string | null;
        };
    }>;
    top_categories?: Array<{
        category: string;
        count: number;
        value: number;
    }>;
    monthly_trends?: Array<{
        month: string;
        procurement_value: number;
        usage_value: number;
    }>;
}

export interface UsageAnalyticsResponse {
    date_range: {
        start_date: string;
        end_date: string;
    };
    summary: {
        total_transactions: number;
        total_consumed: number;
        total_cost: number;
        unique_items_used: number;
        most_used_item: {
            part_number: string;
            item_name: string;
            consumed: number;
        } | null;
        active_categories: number;
    };
    usage_by_item: Array<{
        item_id: number;
        item_name: string;
        part_number: string;
        description: string;
        category: string;
        consumed: number;
        cost: number;
        unit_price: number;
        transaction_count: number;
    }>;
    category_breakdown: Array<{
        category: string;
        consumed: number;
        cost: number;
        item_count: number;
    }>;
    top_consumed_items: Array<{
        item_id: number;
        item_name: string;
        part_number: string;
        description: string;
        category: string;
        consumed: number;
        cost: number;
        unit_price: number;
        transaction_count: number;
    }>;
    daily_summary: Array<{
        date: string;
        count: number;
    }>;

    // Compatibility fields for legacy consumers.
    period?: {
        start_date: string;
        end_date: string;
        days: number;
    };
    total_transactions?: number;
    by_type?: Record<string, { count: number; quantity: number }>;
    top_items?: Array<{
        item_id: number;
        item_name: string;
        part_number: string;
        description: string;
        category: string;
        consumed: number;
        cost: number;
        unit_price: number;
        transaction_count: number;
    }>;
}

export interface ProcurementAnalyticsResponse {
    date_range: {
        start_date: string;
        end_date: string;
    };
    total_procurements: number;
    total_procured: number;
    total_quantity: number;
    total_value: number;
    by_supplier: Array<{
        supplier: string;
        count: number;
        quantity: number;
        value: number;
        items_count: number;
    }>;
    by_category: Array<{
        category: string;
        count: number;
        quantity: number;
        value: number;
        item_count: number;
    }>;
    monthly_breakdown: Array<{
        month: string;
        quantity: number;
        value: number;
    }>;

    // Compatibility fields for legacy consumers.
    period?: {
        start_date: string;
        end_date: string;
    };
}

class ReportsService {
    // Get all reports with pagination and filters
    async getReports(filters: ReportFilters = {}): Promise<ApiResponse<PaginatedResponse<Report>>> {
        const params: Record<string, string | number> = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                params[key] = String(value);
            }
        });

        return api.get<ApiResponse<PaginatedResponse<Report>>>('/v1/reports', params);
    }

    // Get single report
    async getReport(id: number): Promise<ApiResponse<Report>> {
        return api.get<ApiResponse<Report>>(`/v1/reports/${id}`);
    }

    // Generate daily usage report
    async generateDailyUsageReport(request: DailyUsageRequest): Promise<ApiResponse<Report>> {
        return api.post<ApiResponse<Report>>('/v1/reports/daily-usage', request);
    }

    // Generate monthly procurement report
    async generateMonthlyProcurementReport(request: MonthlyProcurementRequest): Promise<ApiResponse<Report>> {
        return api.post<ApiResponse<Report>>('/v1/reports/monthly-procurement', request);
    }

    // Generate reconciliation report
    async generateReconciliationReport(request: ReconciliationRequest): Promise<ApiResponse<Report>> {
        return api.post<ApiResponse<Report>>('/v1/reports/reconciliation', request);
    }

    // Get dashboard analytics
    async getDashboardAnalytics(): Promise<ApiResponse<ReportsDashboardAnalytics>> {
        return api.get<ApiResponse<ReportsDashboardAnalytics>>('/v1/reports/analytics/dashboard');
    }

    // Get usage analytics for specific period
    async getUsageAnalytics(startDate: string, endDate: string): Promise<ApiResponse<UsageAnalyticsResponse>> {
        return api.get<ApiResponse<UsageAnalyticsResponse>>('/v1/reports/analytics/usage', { start_date: startDate, end_date: endDate });
    }

    // Get procurement analytics for specific period
    async getProcurementAnalytics(startDate: string, endDate: string): Promise<ApiResponse<ProcurementAnalyticsResponse>> {
        return api.get<ApiResponse<ProcurementAnalyticsResponse>>('/v1/reports/analytics/procurement', {
            start_date: startDate,
            end_date: endDate,
        });
    }

    // Export report to PDF/Excel (if implemented in backend)
    async exportReport(reportId: number, format: 'pdf' | 'excel'): Promise<Blob> {
        const response = await fetch(`${window.location.origin}/api/v1/reports/${reportId}/export?format=${format}`, {
            method: 'GET',
            headers: {
                Accept: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
        }

        return response.blob();
    }
}

export const reportsService = new ReportsService();

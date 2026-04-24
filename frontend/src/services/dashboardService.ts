/**
 * Dashboard API Service
 * Handles dashboard analytics and frontdesk metrics API calls
 */

import { DashboardAnalytics } from '@/types/inventory';
import { api, ApiResponse } from './api';

class DashboardService {
    /**
     * Get dashboard analytics for frontdesk
     * Returns inventory stats, job pipeline, reservations, and recent activity
     */
    async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
        return api.get<ApiResponse<DashboardAnalytics>>('/v1/reports/analytics/dashboard');
    }
}

export const dashboardService = new DashboardService();

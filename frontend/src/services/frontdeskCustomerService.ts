import {
    FrontdeskCustomer,
    FrontdeskCustomerFilters,
    FrontdeskCustomerMutationPayload,
    FrontdeskCustomerTierPayload,
    FrontdeskVehicle,
    FrontdeskVehiclePayload,
} from '@/types/frontdesk/customers';
import { api, ApiResponse, PaginatedResponse } from './api';

class FrontdeskCustomerService {
    async getCustomers(filters: FrontdeskCustomerFilters = {}): Promise<ApiResponse<PaginatedResponse<FrontdeskCustomer>>> {
        const params: Record<string, string | number> = {};

        if (filters.search) params.search = filters.search;
        if (filters.account_status) params.account_status = filters.account_status;
        if (filters.segment && filters.segment !== 'all') params.segment = filters.segment;
        if (filters.tier) params.tier = filters.tier;
        if (filters.per_page) params.per_page = filters.per_page;
        if (filters.page) params.page = filters.page;

        return api.get<ApiResponse<PaginatedResponse<FrontdeskCustomer>>>('/v1/customers', params);
    }

    async getCustomer(customerId: number): Promise<ApiResponse<FrontdeskCustomer>> {
        return api.get<ApiResponse<FrontdeskCustomer>>(`/v1/customers/${customerId}`);
    }

    async createCustomer(payload: FrontdeskCustomerMutationPayload): Promise<ApiResponse<FrontdeskCustomer>> {
        return api.post<ApiResponse<FrontdeskCustomer>>('/v1/customers', payload);
    }

    async updateCustomer(customerId: number, payload: Partial<FrontdeskCustomerMutationPayload>): Promise<ApiResponse<FrontdeskCustomer>> {
        return api.put<ApiResponse<FrontdeskCustomer>>(`/v1/customers/${customerId}`, payload);
    }

    async setActivation(customerId: number, isActive: boolean): Promise<ApiResponse<FrontdeskCustomer>> {
        return api.patch<ApiResponse<FrontdeskCustomer>>(`/v1/customers/${customerId}/activation`, {
            is_active: isActive,
        });
    }

    async updateTiers(customerId: number, payload: FrontdeskCustomerTierPayload): Promise<ApiResponse<FrontdeskCustomer>> {
        return api.patch<ApiResponse<FrontdeskCustomer>>(`/v1/customers/${customerId}/tiers`, payload);
    }

    async approveCustomer(customerId: number): Promise<ApiResponse<FrontdeskCustomer>> {
        return api.put<ApiResponse<FrontdeskCustomer>>(`/v1/customers/${customerId}/approve`);
    }

    async rejectCustomer(customerId: number, reason: string): Promise<ApiResponse<unknown>> {
        return api.put<ApiResponse<unknown>>(`/v1/customers/${customerId}/reject`, { reason });
    }

    async addVehicle(customerId: number, payload: FrontdeskVehiclePayload): Promise<ApiResponse<FrontdeskVehicle>> {
        return api.post<ApiResponse<FrontdeskVehicle>>(`/v1/customers/${customerId}/vehicles`, {
            customer_id: customerId,
            ...payload,
        });
    }

    async updateVehicle(vehicleId: number, payload: Partial<FrontdeskVehiclePayload>): Promise<ApiResponse<FrontdeskVehicle>> {
        return api.put<ApiResponse<FrontdeskVehicle>>(`/v1/vehicles/${vehicleId}`, payload);
    }

    async deleteVehicle(vehicleId: number): Promise<ApiResponse<{ message: string }>> {
        return api.delete<ApiResponse<{ message: string }>>(`/v1/vehicles/${vehicleId}`);
    }
}

export const frontdeskCustomerService = new FrontdeskCustomerService();

export type CustomerAccountStatus = 'pending' | 'approved' | 'rejected' | 'deleted';
export type CustomerUiStatus = 'Active' | 'Inactive';
export type CustomerTier = 'VIP' | 'Fleet';
export type CustomerTierMode = 'auto' | 'manual';

export interface FrontdeskVehicle {
    id: number;
    customer_id: number;
    plate_number: string;
    make: string;
    model: string;
    year: number;
    color: string | null;
    vin: string | null;
    approval_status: string;
    approved_at: string | null;
    last_service_at: string | null;
    next_due_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FrontdeskCustomer {
    id: number;
    code: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    license_number: string | null;
    account_status: CustomerAccountStatus;
    is_active: boolean;
    status: CustomerUiStatus;
    ui_status: CustomerUiStatus;
    tier_mode: CustomerTierMode;
    tier_overrides: CustomerTier[];
    auto_tiers: CustomerTier[];
    tiers: CustomerTier[];
    vehicles_count: number;
    primary_vehicle: string | null;
    extra_vehicles: number;
    total_jobs: number;
    total_spent: number;
    last_visit_at: string | null;
    customer_since: string | null;
    created_at: string;
    updated_at: string;
    vehicles?: FrontdeskVehicle[];
}

export type CustomerSegmentFilter = 'all' | 'active' | 'inactive' | 'pending';
export type CustomerTierFilter = 'vip' | 'fleet';

export interface FrontdeskCustomerFilters {
    search?: string;
    account_status?: CustomerAccountStatus;
    segment?: CustomerSegmentFilter;
    tier?: CustomerTierFilter;
    per_page?: number;
    page?: number;
}

export interface FrontdeskCustomerMutationPayload {
    first_name: string;
    last_name: string;
    email?: string | null;
    phone_number: string;
    address?: string | null;
    license_number?: string | null;
}

export interface FrontdeskCustomerTierPayload {
    tier_mode: CustomerTierMode;
    tier_overrides?: CustomerTier[];
}

export interface FrontdeskVehiclePayload {
    make: string;
    model: string;
    year: number;
    plate_number: string;
    color?: string | null;
    vin?: string | null;
}

// Re-export from the canonical schema in lib/db/schema.ts
// The customers table lives there so Drizzle migrations pick it up automatically.
export { customers } from '../db/schema';
export type { Customer, NewCustomer } from '../db/schema';

// Thin shims kept for backward-compat with lib/customers/index.ts
export type CustomerOrder = {
    id: string;
    customerId: string;
    orderNumber: string;
    orderTotal: string;
    createdAt: string;
};
export type NewCustomerOrder = Omit<CustomerOrder, 'id' | 'createdAt'>;

export const customerOrders = null; // legacy – no longer a separate table

// Helper types
export interface CustomerWithStats {
    id: string;
    businessId: string;
    phone: string;
    name: string;
    address?: string | null;
    totalPurchases: string;
    orderCount: number;
    lastOrderAt?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    recentOrderNumbers?: string[];
}

export interface CustomerSearchResult {
    id: string;
    phone: string;
    name: string;
    address?: string;
    totalPurchases: number;
    orderCount: number;
    lastOrderAt?: string;
}

export const customerIndexes = {
    customersByPhone: 'idx_customers_phone',
    customersByName: 'idx_customers_name',
    customersByCreatedBy: 'idx_customers_created_by',
    customersByCreatedAt: 'idx_customers_created_at',
};

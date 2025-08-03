import { createClient } from '@/utils/supabase/client';
import type {
    Customer,
    CustomerSearchResult,
    CreateCustomer
} from '@/lib/customers';

const supabase = createClient();

export interface CustomersListResult {
    customers: CustomerSearchResult[];
    totalCount: number;
    hasMore: boolean;
}

export class CustomerClientService {
    // Search customer by phone number
    async searchByPhone(phone: string): Promise<CustomerSearchResult | null> {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
          id,
          phone,
          name,
          address,
          total_purchases,
          order_count,
          last_order_at
        `)
                .eq('phone', phone)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No customer found
                    return null;
                }
                throw new Error(`Failed to search customer: ${error.message}`);
            }

            return {
                id: data.id,
                phone: data.phone,
                name: data.name,
                address: data.address || undefined,
                totalPurchases: parseFloat(String(data.total_purchases || 0)),
                orderCount: parseInt(String(data.order_count || 0)),
                lastOrderAt: data.last_order_at || undefined,
            };
        } catch (error) {
            console.error('Error searching customer by phone:', error);
            throw error;
        }
    }

    // Search customers by multiple criteria (phone, name, or address)
    async searchCustomers(searchTerm: string): Promise<CustomerSearchResult[]> {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    id,
                    phone,
                    name,
                    address,
                    total_purchases,
                    order_count,
                    last_order_at
                `)
                .or(`phone.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
                .order('last_order_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(20); // Limit results for performance

            if (error) {
                throw new Error(`Failed to search customers: ${error.message}`);
            }

            return (data || []).map(customer => ({
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                address: customer.address || undefined,
                totalPurchases: parseFloat(String(customer.total_purchases || 0)),
                orderCount: parseInt(String(customer.order_count || 0)),
                lastOrderAt: customer.last_order_at || undefined,
            }));
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    }

    // Create a new customer
    async createCustomer(customerData: CreateCustomer, createdBy: string): Promise<Customer> {
        try {
            const newCustomerData = {
                phone: customerData.phone,
                name: customerData.name,
                address: customerData.address || null,
                total_purchases: 0,
                order_count: 0,
                created_by: createdBy,
            };

            const { data, error } = await supabase
                .from('customers')
                .insert(newCustomerData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create customer: ${error.message}`);
            }

            return {
                id: data.id,
                phone: data.phone,
                name: data.name,
                address: data.address,
                totalPurchases: String(data.total_purchases || 0),
                orderCount: String(data.order_count || 0),
                lastOrderAt: data.last_order_at ? new Date(data.last_order_at) : null,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                createdBy: data.created_by,
            };
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    // Update customer purchase totals (called when order is created)
    async updateCustomerPurchases(
        customerId: string,
        orderTotal: number,
        orderNumber: string
    ): Promise<Customer> {
        try {
            // First, get current customer data
            const { data: currentCustomer, error: fetchError } = await supabase
                .from('customers')
                .select('total_purchases, order_count')
                .eq('id', customerId)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch customer for update: ${fetchError.message}`);
            }

            const currentTotal = parseFloat(String(currentCustomer.total_purchases || 0));
            const currentCount = parseInt(String(currentCustomer.order_count || 0));

            // Update customer totals
            const { data, error } = await supabase
                .from('customers')
                .update({
                    total_purchases: currentTotal + orderTotal,
                    order_count: currentCount + 1,
                    last_order_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', customerId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update customer purchases: ${error.message}`);
            }

            // Also record in customer_orders junction table
            await supabase
                .from('customer_orders')
                .insert({
                    customer_id: customerId,
                    order_number: orderNumber,
                    order_total: orderTotal,
                });

            return {
                id: data.id,
                phone: data.phone,
                name: data.name,
                address: data.address,
                totalPurchases: String(data.total_purchases || 0),
                orderCount: String(data.order_count || 0),
                lastOrderAt: data.last_order_at ? new Date(data.last_order_at) : null,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                createdBy: data.created_by,
            };
        } catch (error) {
            console.error('Error updating customer purchases:', error);
            throw error;
        }
    }

    // Update customer information
    async updateCustomer(customerId: string, updates: {
        name?: string;
        phone?: string;
        address?: string;
    }): Promise<void> {
        try {
            const updateData: Record<string, string | null> = {};
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.address !== undefined) updateData.address = updates.address || null;

            const { error } = await supabase
                .from('customers')
                .update(updateData)
                .eq('id', customerId);

            if (error) {
                throw new Error(`Failed to update customer: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    // Get all customers with pagination
    async getCustomersList(offset = 0, limit = 50): Promise<CustomersListResult> {
        try {
            const { data, error, count } = await supabase
                .from('customers')
                .select(`
                    id,
                    phone,
                    name,
                    address,
                    total_purchases,
                    order_count,
                    last_order_at
                `, { count: 'exact' })
                .order('last_order_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Failed to fetch customers: ${error.message}`);
            }

            const customers: CustomerSearchResult[] = (data || []).map(customer => ({
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                address: customer.address || undefined,
                totalPurchases: parseFloat(String(customer.total_purchases || 0)),
                orderCount: parseInt(String(customer.order_count || 0)),
                lastOrderAt: customer.last_order_at || undefined,
            }));

            return {
                customers,
                totalCount: count || 0,
                hasMore: (offset + limit) < (count || 0),
            };
        } catch (error) {
            console.error('Error fetching customers list:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const customerClientService = new CustomerClientService();

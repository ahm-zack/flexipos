import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/database.types';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export interface CreateCustomerParams {
    name: string;
    phone: string;
    address?: string;
}

export class CustomerClientService {
    // ─── READ ──────────────────────────────────────────────────────────────

    /** Fetch all customers for the given business, newest first */
    async getCustomers(businessId: string): Promise<Customer[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data ?? [];
    }

    /** Fetch a single customer by ID (scoped to business) */
    async getCustomerById(id: string, businessId: string): Promise<Customer | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .eq('business_id', businessId)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Search customer by phone within a specific business.
     * Returns null if not found.
     */
    async searchByPhone(phone: string, businessId: string): Promise<Customer | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .ilike('phone', `%${phone}%`)
            .limit(1)
            .maybeSingle();

        if (error) return null;
        return data;
    }

    /** Full-text search by name or phone within a business */
    async search(query: string, businessId: string): Promise<Customer[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
            .order('name', { ascending: true })
            .limit(20);

        if (error) throw new Error(error.message);
        return data ?? [];
    }

    // ─── CREATE ────────────────────────────────────────────────────────────

    async createCustomer(
        params: CreateCustomerParams,
        businessId: string,
        createdBy: string
    ): Promise<Customer> {
        const supabase = createClient();

        // Check for existing customer with same phone in this business
        const existing = await this.searchByPhone(params.phone, businessId);
        if (existing) return existing; // Upsert-style: return existing if phone matches

        const { data, error } = await supabase
            .from('customers')
            .insert({
                business_id: businessId,
                name: params.name,
                phone: params.phone,
                address: params.address ?? null,
                created_by: createdBy,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────

    async updateCustomer(
        id: string,
        businessId: string,
        updates: Partial<Pick<Customer, 'name' | 'phone' | 'address'>>
    ): Promise<Customer> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('customers')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('business_id', businessId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Increment order stats after a successful order.
     * Called after checkout.
     */
    async recordPurchase(
        customerId: string,
        businessId: string,
        orderTotal: number
    ): Promise<void> {
        const supabase = createClient();

        // Fetch current stats
        const { data: current, error: fetchErr } = await supabase
            .from('customers')
            .select('total_purchases, order_count')
            .eq('id', customerId)
            .eq('business_id', businessId)
            .single();

        if (fetchErr || !current) return;

        const newTotal = (parseFloat(current.total_purchases) + orderTotal).toFixed(2);
        const newCount = current.order_count + 1;

        await supabase
            .from('customers')
            .update({
                total_purchases: newTotal,
                order_count: newCount,
                last_order_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', customerId)
            .eq('business_id', businessId);
    }

    // ─── DELETE ────────────────────────────────────────────────────────────

    async deleteCustomer(id: string, businessId: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)
            .eq('business_id', businessId);

        if (error) throw new Error(error.message);
    }
}

// Singleton
export const customerService = new CustomerClientService();
export default CustomerClientService;
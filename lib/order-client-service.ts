// Import types and Supabase client
import type { Database } from '@/database.types';
import type { OrderFilters } from '@/lib/order-service';
import { createClient } from '@supabase/supabase-js';

// Use database types directly
type CreateOrder = Database['public']['Tables']['orders']['Insert'];

// Initialize Supabase client for client-side operations
const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const orderClientService = {
    async createOrder(orderData: CreateOrder) {
        const { data, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }

        return data;
    },

    async getOrders(filters?: OrderFilters, page?: number, limit?: number) {
        let query = supabase.from('orders').select('*');

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.paymentMethod) {
            query = query.eq('payment_method', filters.paymentMethod);
        }
        if (filters?.customerName) {
            query = query.ilike('customer_name', `%${filters.customerName}%`);
        }
        if (filters?.orderNumber) {
            query = query.ilike('order_number', `%${filters.orderNumber}%`);
        }
        if (filters?.createdBy) {
            query = query.eq('created_by', filters.createdBy);
        }
        if (filters?.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
        }
        if (filters?.dateTo) {
            query = query.lte('created_at', filters.dateTo);
        }

        // Apply pagination
        const pageSize = limit || 10;
        const offset = ((page || 1) - 1) * pageSize;
        query = query.range(offset, offset + pageSize - 1);

        // Order by created_at descending
        query = query.order('created_at', { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Failed to fetch orders: ${error.message}`);
        }

        return {
            orders: data || [],
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
            currentPage: page || 1,
            totalCount: count || 0,
        };
    },

    async getOrderById(id: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Failed to fetch order: ${error.message}`);
        }

        return data;
    },

    async updateOrder(id: string, updateData: Record<string, unknown>) {
        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update order: ${error.message}`);
        }

        return data;
    },

    async deleteOrder(id: string) {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete order: ${error.message}`);
        }
    },

    async cancelOrder(id: string, canceledBy: string, reason?: string) {
        // First, get the original order data
        const { data: originalOrder, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch original order: ${fetchError.message}`);
        }

        // Insert into canceled_orders table with order data
        const { data: cancelData, error: cancelError } = await supabase
            .from('canceled_orders')
            .insert({
                business_id: originalOrder.business_id,
                original_order_id: id,
                canceled_by: canceledBy,
                reason: reason || null,
                order_data: originalOrder,
            })
            .select()
            .single();

        if (cancelError) {
            throw new Error(`Failed to cancel order: ${cancelError.message}`);
        }

        // Update the original order status
        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'canceled' })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }

        return { order: data, cancellation: cancelData };
    },

    async modifyOrder(id: string, modificationData: Record<string, unknown>) {
        // This would typically involve creating a modified_orders record
        // and updating the original order
        const { data, error } = await supabase
            .from('orders')
            .update(modificationData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to modify order: ${error.message}`);
        }

        return data;
    },

    async getOrderHistory(id: string) {
        // Get order with its modifications and cancellations
        const [orderResult, canceledResult, modifiedResult] = await Promise.all([
            supabase.from('orders').select('*').eq('id', id).single(),
            supabase.from('canceled_orders').select('*').eq('original_order_id', id),
            supabase.from('modified_orders').select('*').eq('original_order_id', id),
        ]);

        if (orderResult.error) {
            throw new Error(`Failed to fetch order history: ${orderResult.error.message}`);
        }

        return {
            order: orderResult.data,
            cancellations: canceledResult.data || [],
            modifications: modifiedResult.data || [],
        };
    },

    async getCanceledOrders() {
        const { data, error } = await supabase
            .from('canceled_orders')
            .select(`
                *,
                orders(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch canceled orders: ${error.message}`);
        }

        return data;
    },

    async getModifiedOrders() {
        const { data, error } = await supabase
            .from('modified_orders')
            .select(`
                *,
                orders(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch modified orders: ${error.message}`);
        }

        return data;
    }
};
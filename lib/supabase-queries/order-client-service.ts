import { createClient } from '@/utils/supabase/client';
import type { Order, OrderItem, CanceledOrder, ModifiedOrder } from '@/lib/orders/schemas';
import type { OrderFilters } from '@/lib/order-service';
import type { CartItem } from '@/lib/orders/schemas';

// Local Json type definition to avoid import issues
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export const supabase = createClient();

// Type transformations
const transformCartItemsToOrderItems = (cartItems: CartItem[]): OrderItem[] => {
    return cartItems.map(cartItem => {
        // Map category to type, handle variations
        let type: 'pizza' | 'pie' | 'sandwich' | 'mini_pie' = 'pizza'; // default
        const category = cartItem.category.toLowerCase();

        if (category.includes('pizza')) type = 'pizza';
        else if (category.includes('pie') && category.includes('mini')) type = 'mini_pie';
        else if (category.includes('pie')) type = 'pie';
        else if (category.includes('sandwich')) type = 'sandwich';

        const basePrice = cartItem.price || 0;
        const modifiersTotal = cartItem.modifiersTotal || 0;
        const unitPrice = basePrice + modifiersTotal;
        const quantity = cartItem.quantity || 1;

        return {
            id: cartItem.id,
            type,
            name: cartItem.name,
            nameAr: cartItem.name, // Use same name for now, or get from item data
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
            details: {
                description: cartItem.description,
                image: cartItem.image,
                modifiers: cartItem.modifiers,
                category: cartItem.category,
            },
        };
    });
};

const transformSupabaseToOrder = (row: Record<string, unknown>): Order => ({
    id: row.id as string,
    orderNumber: row.order_number as string,
    dailySerial: (row.daily_serial as string) || undefined,
    serialDate: (row.serial_date as string) || undefined,
    customerName: row.customer_name as string | undefined,
    items: Array.isArray(row.items) ? row.items as OrderItem[] : [],
    totalAmount: typeof row.total_amount === 'string' ? parseFloat(row.total_amount) : (row.total_amount as number),
    paymentMethod: row.payment_method as 'cash' | 'card' | 'mixed',
    status: row.status as 'completed' | 'canceled' | 'modified',
    discountType: row.discount_type as 'percentage' | 'amount' | undefined,
    discountValue: row.discount_value ? (typeof row.discount_value === 'string' ? parseFloat(row.discount_value) : row.discount_value as number) : undefined,
    discountAmount: row.discount_amount ? (typeof row.discount_amount === 'string' ? parseFloat(row.discount_amount) : row.discount_amount as number) : undefined,
    eventDiscountName: row.event_discount_name as string | undefined,
    eventDiscountPercentage: row.event_discount_percentage ? (typeof row.event_discount_percentage === 'string' ? parseFloat(row.event_discount_percentage) : row.event_discount_percentage as number) : undefined,
    eventDiscountAmount: row.event_discount_amount ? (typeof row.event_discount_amount === 'string' ? parseFloat(row.event_discount_amount) : row.event_discount_amount as number) : undefined,
    // Payment tracking fields
    cashAmount: row.cash_amount !== null && row.cash_amount !== undefined ? (typeof row.cash_amount === 'string' ? parseFloat(row.cash_amount) : row.cash_amount as number) : undefined,
    cardAmount: row.card_amount !== null && row.card_amount !== undefined ? (typeof row.card_amount === 'string' ? parseFloat(row.card_amount) : row.card_amount as number) : undefined,
    cashReceived: row.cash_received !== null && row.cash_received !== undefined ? (typeof row.cash_received === 'string' ? parseFloat(row.cash_received) : row.cash_received as number) : undefined,
    changeAmount: row.change_amount !== null && row.change_amount !== undefined ? (typeof row.change_amount === 'string' ? parseFloat(row.change_amount) : row.change_amount as number) : undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    createdBy: row.created_by as string,
});

const transformSupabaseToCanceledOrder = (row: Record<string, unknown>): CanceledOrder => ({
    id: row.id as string,
    originalOrderId: row.original_order_id as string,
    canceledAt: new Date(row.canceled_at as string).toISOString(),
    canceledBy: row.canceled_by as string,
    reason: row.reason as string | undefined,
    orderData: row.order_data as Order,
});

const transformSupabaseToModifiedOrder = (row: Record<string, unknown>): ModifiedOrder => ({
    id: row.id as string,
    originalOrderId: row.original_order_id as string,
    modifiedAt: new Date(row.modified_at as string).toISOString(),
    modifiedBy: row.modified_by as string,
    modificationType: row.modification_type as 'item_added' | 'item_removed' | 'quantity_changed' | 'item_replaced' | 'multiple_changes',
    originalData: row.original_data as Order,
    newData: row.new_data as Order,
});

// Generate order number helper
const generateOrderNumber = async (): Promise<string> => {
    // Get the latest order number to determine the next sequence
    const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        // If there's an error or no orders exist, start with ORD-0001
        return 'ORD-0001';
    }

    if (!data || data.length === 0) {
        // No orders exist yet, start with ORD-0001
        return 'ORD-0001';
    }

    const lastOrderNumber = data[0].order_number as string;

    // Extract the number from the last order number (e.g., "ORD-0001" -> 1)
    const match = lastOrderNumber.match(/ORD-(\d+)/);
    if (!match) {
        // If format doesn't match, start fresh
        return 'ORD-0001';
    }

    const lastNumber = parseInt(match[1], 10);
    const nextNumber = lastNumber + 1;

    // Format with leading zeros (4 digits)
    return `ORD-${nextNumber.toString().padStart(4, '0')}`;
};

// Generate daily serial helper - robust version with fallbacks
// TEMPORARILY DISABLED - will be re-enabled once database types are updated
/*
const generateDailySerial = async (): Promise<{ serial: string; serialDate: string }> => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
        // Try to get count of orders from today using a simple approach
        const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00.000Z`)
            .lt('created_at', `${today}T23:59:59.999Z`);
        
        if (error) {
            console.warn('Failed to count today\'s orders:', error.message);
            // Fallback: use time-based serial
            const now = new Date();
            const timeSerial = (now.getHours() * 100 + now.getMinutes()).toString().padStart(4, '0').slice(-3);
            return {
                serial: timeSerial,
                serialDate: today
            };
        }
        
        const nextSerial = ((count || 0) + 1).toString().padStart(3, '0');
        
        return {
            serial: nextSerial,
            serialDate: today
        };
    } catch (error) {
        console.error('Error generating daily serial:', error);
        // Ultimate fallback: use random 3-digit number
        const fallbackSerial = Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0');
        return {
            serial: fallbackSerial,
            serialDate: today
        };
    }
};
*/

export interface OrdersListResult {
    orders: Array<Order & { cashierName?: string }>;
    total: number;
    page: number;
    limit: number;
}

export interface OrderHistoryResult {
    order: Order & { cashierName?: string };
    cancellations: CanceledOrder[];
    modifications: ModifiedOrder[];
}

export interface CreateOrderData {
    customerName?: string;
    items: CartItem[]; // Accept CartItem[] for creating orders
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mixed';
    discountType?: 'percentage' | 'amount';
    discountValue?: number;
    discountAmount?: number;
    eventDiscountName?: string;
    eventDiscountPercentage?: number;
    eventDiscountAmount?: number;
    // Payment tracking fields
    cashAmount?: number;
    cardAmount?: number;
    cashReceived?: number;
    changeAmount?: number;
    createdBy: string;
}

export interface ModifyOrderData {
    modifiedBy: string;
    modificationType: 'item_added' | 'item_removed' | 'quantity_changed' | 'item_replaced' | 'multiple_changes';
    customerName?: string;
    items?: OrderItem[];
    totalAmount?: number;
    paymentMethod?: 'cash' | 'card' | 'mixed';
    reason?: string;
}

export const orderClientService = {
    // Get orders with filters and pagination
    async getOrders(filters: OrderFilters = {}, page = 1, limit = 10): Promise<OrdersListResult> {
        let query = supabase
            .from('orders')
            .select(`
        *
      `, { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.paymentMethod) query = query.eq('payment_method', filters.paymentMethod);
        if (filters.customerName) query = query.ilike('customer_name', `%${filters.customerName}%`);
        if (filters.orderNumber) query = query.ilike('order_number', `%${filters.orderNumber}%`);
        if (filters.createdBy) query = query.eq('created_by', filters.createdBy);
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

        // Transform data
        const orders = (data || []).map(row => ({
            ...transformSupabaseToOrder(row),
        }));

        return {
            orders,
            total: count || 0,
            page,
            limit,
        };
    },

    // Get single order by ID
    async getOrderById(id: string): Promise<Order & { cashierName?: string }> {
        const { data, error } = await supabase
            .from('orders')
            .select(`*`)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') throw new Error('Order not found');
            throw new Error(`Failed to fetch order: ${error.message}`);
        }

        return {
            ...transformSupabaseToOrder(data),
        };
    },

    // Create new order
    async createOrder(orderData: CreateOrderData): Promise<Order> {
        // Generate order number (global)
        const orderNumber = await generateOrderNumber();

        // Get the next daily serial from the database function
        const { data: dailySerialData, error: dailySerialError } = await supabase
            .rpc('get_next_daily_serial');

        if (dailySerialError) {
            console.error('Error generating daily serial:', dailySerialError);
            // Continue without daily serial if there's an error
        }

        const dailySerial = dailySerialData?.[0];

        // Convert cart items to order items format
        const orderItems = transformCartItemsToOrderItems(orderData.items);

        // Debug log for payment data
        console.log("💾 Inserting order with payment data:", {
            paymentMethod: orderData.paymentMethod,
            cashAmount: orderData.cashAmount,
            cardAmount: orderData.cardAmount,
            cashReceived: orderData.cashReceived,
            changeAmount: orderData.changeAmount
        });

        const { data, error } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                daily_serial: dailySerial?.serial || null,
                serial_date: dailySerial?.serial_date || null,
                customer_name: orderData.customerName || null,
                items: orderItems as unknown as Json,
                total_amount: orderData.totalAmount,
                payment_method: orderData.paymentMethod,
                discount_type: orderData.discountType || null,
                discount_value: orderData.discountValue || null,
                discount_amount: orderData.discountAmount || 0,
                event_discount_name: orderData.eventDiscountName || null,
                event_discount_percentage: orderData.eventDiscountPercentage || null,
                event_discount_amount: orderData.eventDiscountAmount || 0,
                created_by: orderData.createdBy,
                // Payment tracking fields
                cash_amount: orderData.cashAmount || null,
                card_amount: orderData.cardAmount || null,
                cash_received: orderData.cashReceived || null,
                change_amount: orderData.changeAmount || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create order: ${error.message}`);
        return transformSupabaseToOrder(data);
    },

    // Update order
    async updateOrder(id: string, updateData: Partial<Order>): Promise<Order> {
        const updateFields: Record<string, unknown> = {};

        if (updateData.customerName !== undefined) updateFields.customer_name = updateData.customerName;
        if (updateData.items !== undefined) updateFields.items = updateData.items as unknown as Json;
        if (updateData.totalAmount !== undefined) updateFields.total_amount = updateData.totalAmount;
        if (updateData.status !== undefined) updateFields.status = updateData.status;
        if (updateData.paymentMethod !== undefined) updateFields.payment_method = updateData.paymentMethod;

        updateFields.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('orders')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update order: ${error.message}`);
        return transformSupabaseToOrder(data);
    },

    // Delete order (soft delete by updating status)
    async deleteOrder(id: string): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'canceled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(`Failed to delete order: ${error.message}`);
    },

    // Cancel order
    async cancelOrder(id: string, canceledBy: string, reason?: string): Promise<CanceledOrder> {
        // First get the original order
        const originalOrder = await this.getOrderById(id);

        // Convert order to JSON format for storage
        const orderDataForStorage = JSON.parse(JSON.stringify(originalOrder));

        // Insert into canceled_orders table
        const { data, error } = await supabase
            .from('canceled_orders')
            .insert({
                original_order_id: id,
                canceled_by: canceledBy,
                reason,
                order_data: orderDataForStorage,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to cancel order: ${error.message}`);

        // Update original order status
        await this.updateOrder(id, { status: 'canceled' });

        return transformSupabaseToCanceledOrder(data);
    },

    // Modify order
    async modifyOrder(id: string, modificationData: ModifyOrderData): Promise<ModifiedOrder> {
        // First get the original order
        const originalOrder = await this.getOrderById(id);

        // Create new order data with modifications
        const newOrderData = {
            ...originalOrder,
            customerName: modificationData.customerName ?? originalOrder.customerName,
            items: modificationData.items ?? originalOrder.items,
            totalAmount: modificationData.totalAmount ?? originalOrder.totalAmount,
            paymentMethod: modificationData.paymentMethod ?? originalOrder.paymentMethod,
        };

        // Convert orders to JSON format for storage
        const originalDataForStorage = JSON.parse(JSON.stringify(originalOrder));
        const newDataForStorage = JSON.parse(JSON.stringify(newOrderData));

        // Insert into modified_orders table
        const { data, error } = await supabase
            .from('modified_orders')
            .insert({
                original_order_id: id,
                modified_by: modificationData.modifiedBy,
                modification_type: modificationData.modificationType,
                original_data: originalDataForStorage,
                new_data: newDataForStorage,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to modify order: ${error.message}`);

        // Update the original order with new data
        await this.updateOrder(id, {
            customerName: newOrderData.customerName,
            items: newOrderData.items,
            totalAmount: newOrderData.totalAmount,
            paymentMethod: newOrderData.paymentMethod,
            status: 'modified',
        });

        return transformSupabaseToModifiedOrder(data);
    },

    // Get order history (order + cancellations + modifications)
    async getOrderHistory(id: string): Promise<OrderHistoryResult> {
        // Get the main order
        const order = await this.getOrderById(id);

        // Get cancellations for this order
        const { data: cancellationData, error: cancellationError } = await supabase
            .from('canceled_orders')
            .select('*')
            .eq('original_order_id', id)
            .order('canceled_at', { ascending: false });

        if (cancellationError) throw new Error(`Failed to fetch order cancellations: ${cancellationError.message}`);

        // Get modifications for this order
        const { data: modificationData, error: modificationError } = await supabase
            .from('modified_orders')
            .select('*')
            .eq('original_order_id', id)
            .order('modified_at', { ascending: false });

        if (modificationError) throw new Error(`Failed to fetch order modifications: ${modificationError.message}`);

        return {
            order,
            cancellations: (cancellationData || []).map(transformSupabaseToCanceledOrder),
            modifications: (modificationData || []).map(transformSupabaseToModifiedOrder),
        };
    },

    // Get all canceled orders
    async getCanceledOrders(): Promise<CanceledOrder[]> {
        const { data, error } = await supabase
            .from('canceled_orders')
            .select('*')
            .order('canceled_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch canceled orders: ${error.message}`);

        return (data || []).map(transformSupabaseToCanceledOrder);
    },

    // Get all modified orders
    async getModifiedOrders(): Promise<ModifiedOrder[]> {
        const { data, error } = await supabase
            .from('modified_orders')
            .select('*')
            .order('modified_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch modified orders: ${error.message}`);

        return (data || []).map(transformSupabaseToModifiedOrder);
    },
};

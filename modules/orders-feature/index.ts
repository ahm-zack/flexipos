// Modern orders feature module using dynamic product system
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useBusinessContext } from '@/modules/providers/components/business-provider';
import type { Database } from '@/database.types';

// Use database-generated types for consistency
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type DeliveryPlatform = Database['public']['Enums']['delivery_platform'];
export type OrderStatus = Database['public']['Enums']['order_status'];

// Enhanced order item interface for dynamic products
export interface OrderItem {
    id: string; // Product ID from menu_items table
    name: string; // Item name (English)
    nameAr: string; // Item name (Arabic)  
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string; // Category name for display
    description?: string;
    image?: string;
    modifiers?: Array<{
        id: string;
        name: string;
        price: number;
        type: 'extra' | 'without';
    }>;
    modifiersTotal?: number;
}

// Complete order structure with typed items
export interface OrderWithItems extends Omit<Order, 'items'> {
    items: OrderItem[];
}

// Legacy alias for backward compatibility
export type ApiOrder = OrderWithItems;

// Cart item interface for dynamic products
export interface CartItem {
    id: string; // Product ID from menu_items table
    name: string;
    nameAr?: string;
    price: number;
    quantity: number;
    category: string; // Category name from categories table
    description?: string;
    image?: string;
    modifiers?: Array<{
        id: string;
        name: string;
        price: number;
        type: 'extra' | 'without';
    }>;
    modifiersTotal?: number;
}

// Order creation data structure using database types
export interface CreateOrderData {
    customerName?: string;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    deliveryPlatform?: DeliveryPlatform;
    discountType?: 'percentage' | 'amount';
    discountValue?: number;
    discountAmount?: number;
    eventDiscountName?: string;
    eventDiscountPercentage?: number;
    eventDiscountAmount?: number;
    cashAmount?: number;
    cardAmount?: number;
    cashReceived?: number;
    changeAmount?: number;
    createdBy: string;
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessContext();

    return useMutation({
        mutationFn: async (orderData: CreateOrderData) => {
            if (!businessId) throw new Error('No business context');
            const supabase = createClient();

            // Get next serial atomically — each business has independent serial starting at 1
            const { data: serial, error: serialError } = await supabase
                .rpc('get_next_order_serial', { p_business_id: businessId });
            if (serialError) throw new Error(serialError.message);

            const orderNumber = String(serial as number);

            // Map client data to database format
            const dbOrderData = {
                business_id: businessId,
                order_number: orderNumber,
                customer_name: orderData.customerName || null,
                items: orderData.items as unknown as Database['public']['Tables']['orders']['Insert']['items'],
                total_amount: orderData.totalAmount,
                payment_method: orderData.paymentMethod,
                delivery_platform: orderData.deliveryPlatform || null,
                discount_type: orderData.discountType || null,
                discount_value: orderData.discountValue || null,
                discount_amount: orderData.discountAmount || null,
                event_discount_name: orderData.eventDiscountName || null,
                event_discount_percentage: orderData.eventDiscountPercentage || null,
                event_discount_amount: orderData.eventDiscountAmount || null,
                cash_amount: orderData.cashAmount || null,
                card_amount: orderData.cardAmount || null,
                cash_received: orderData.cashReceived || null,
                change_amount: orderData.changeAmount || null,
                created_by: orderData.createdBy,
                status: 'completed' as const,
            };

            const { data: createdOrder, error } = await supabase
                .from('orders')
                .insert(dbOrderData)
                .select()
                .single();

            if (error) throw new Error(error.message);

            // Convert database response to client-friendly format
            return {
                id: createdOrder.id,
                orderNumber: createdOrder.order_number,
                customerName: createdOrder.customer_name,
                items: createdOrder.items,
                totalAmount: createdOrder.total_amount,
                paymentMethod: createdOrder.payment_method,
                deliveryPlatform: createdOrder.delivery_platform,
                status: createdOrder.status,
                discountType: createdOrder.discount_type,
                discountValue: createdOrder.discount_value,
                discountAmount: createdOrder.discount_amount,
                eventDiscountName: createdOrder.event_discount_name,
                eventDiscountPercentage: createdOrder.event_discount_percentage,
                eventDiscountAmount: createdOrder.event_discount_amount,
                cashAmount: createdOrder.cash_amount,
                cardAmount: createdOrder.card_amount,
                cashReceived: createdOrder.cash_received,
                changeAmount: createdOrder.change_amount,
                createdAt: createdOrder.created_at,
                updatedAt: createdOrder.updated_at,
                createdBy: createdOrder.created_by,
                dailySerial: createdOrder.daily_serial,
                serialDate: createdOrder.serial_date,
            };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}



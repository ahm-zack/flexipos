// Minimal orders feature module for cart functionality
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderClientService, type CreateOrderData as ClientCreateOrderData } from '@/lib/order-client-service';

// Export types that cart components need - compatible with restaurant receipt
export interface ApiOrder {
    id: string;
    orderNumber: string;
    dailySerial?: string;
    customerName: string | null;
    items: Array<{
        id: string;
        type: 'pizza' | 'pie' | 'sandwich' | 'mini_pie';
        name: string;
        nameAr: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        details?: Record<string, unknown>;
    }>;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mixed' | 'delivery';
    deliveryPlatform?: 'keeta' | 'hunger_station' | 'jahez';
    status: 'completed' | 'canceled' | 'modified';
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
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

// Define CartItem type inline since it's not exported
export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
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

// Define the order data structure based on orderService.createOrder params
export interface CreateOrderData {
    customerName?: string;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mixed' | 'delivery';
    deliveryPlatform?: 'keeta' | 'hunger_station' | 'jahez';
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

    return useMutation({
        mutationFn: async (orderData: CreateOrderData) => {
            return await orderClientService.createOrder(orderData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}

// Export client service instead of server service to avoid client-side imports
export { orderClientService as orderService } from '@/lib/order-client-service';
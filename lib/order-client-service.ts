// Import OrderFilters type from order-service
import type { OrderFilters } from '@/lib/order-service';

// Client-side order service that makes API calls instead of direct database calls
export interface CreateOrderData {
    customerName?: string;
    items: Array<{
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
    }>;
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

export const orderClientService = {
    async createOrder(orderData: CreateOrderData) {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        const result = await response.json();
        return result.data;
    },

    async getOrders(filters?: OrderFilters, page?: number, limit?: number) {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value as string);
            });
        }

        const response = await fetch(`/api/orders?${params}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    async getOrderById(id: string) {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        return response.json();
    },

    async updateOrder(id: string, updateData: Record<string, unknown>) {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('Failed to update order');
        return response.json();
    },

    async deleteOrder(id: string) {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete order');
        return response.json();
    },

    async cancelOrder(id: string, canceledBy: string, reason?: string) {
        const response = await fetch(`/api/orders/${id}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ canceledBy, reason }),
        });
        if (!response.ok) throw new Error('Failed to cancel order');
        return response.json();
    },

    async modifyOrder(id: string, modificationData: Record<string, unknown>) {
        const response = await fetch(`/api/orders/${id}/modify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modificationData),
        });
        if (!response.ok) throw new Error('Failed to modify order');
        return response.json();
    },

    async getOrderHistory(id: string) {
        const response = await fetch(`/api/orders/${id}/history`);
        if (!response.ok) throw new Error('Failed to fetch order history');
        return response.json();
    },

    async getCanceledOrders() {
        const response = await fetch('/api/orders/canceled');
        if (!response.ok) throw new Error('Failed to fetch canceled orders');
        return response.json();
    },

    async getModifiedOrders() {
        const response = await fetch('/api/orders/modified');
        if (!response.ok) throw new Error('Failed to fetch modified orders');
        return response.json();
    }
};
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Re-export database types for convenience
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type DeliveryPlatform = Database['public']['Enums']['delivery_platform'];
export type OrderStatus = Database['public']['Enums']['order_status'];

// Order filters interface
export interface OrderFilters {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  orderNumber?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Service result interface
export interface OrderServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Order item interface for creating orders
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

export class OrderService {
  // Get orders with filters and pagination
  async getOrders(filters?: OrderFilters): Promise<OrderServiceResult<{
    orders: Order[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.paymentMethod) {
          query = query.eq('payment_method', filters.paymentMethod);
        }
        if (filters.customerName) {
          query = query.ilike('customer_name', `%${filters.customerName}%`);
        }
        if (filters.orderNumber) {
          query = query.ilike('order_number', `%${filters.orderNumber}%`);
        }
        if (filters.createdBy) {
          query = query.eq('created_by', filters.createdBy);
        }
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }
      }

      const { data: orders, error, count } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: error.message };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          orders: orders || [],
          total,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      console.error('Error in getOrders:', error);
      return { success: false, error: 'Failed to fetch orders' };
    }
  }

  // Get single order by ID
  async getOrderById(id: string): Promise<OrderServiceResult<Order>> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return { success: false, error: 'Failed to fetch order' };
    }
  }

  // Create new order
  async createOrder(orderData: {
    customerName?: string;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    deliveryPlatform?: DeliveryPlatform;
    discountType?: string;
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
    orderNumber?: string;
  }): Promise<OrderServiceResult<Order>> {
    try {
      // Generate order number if not provided
      const orderNumber = orderData.orderNumber || `ORD-${Date.now()}`;

      // Convert items to JSON format for storage
      const itemsJson = orderData.items;

      const insertData: OrderInsert = {
        order_number: orderNumber,
        customer_name: orderData.customerName || null,
        items: itemsJson as unknown as Database['public']['Tables']['orders']['Insert']['items'],
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
        status: 'completed',
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('Error in createOrder:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
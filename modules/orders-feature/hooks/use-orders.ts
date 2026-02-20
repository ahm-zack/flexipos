'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useBusinessContext } from '@/modules/providers/components/business-provider';
import type { Database } from '@/database.types';

// ─── Types from DB (snake_case) ───────────────────────────────────────────────

export type Order = Database['public']['Tables']['orders']['Row'];
export type CanceledOrder = Database['public']['Tables']['canceled_orders']['Row'];
export type ModifiedOrder = Database['public']['Tables']['modified_orders']['Row'];

export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type DeliveryPlatform = Database['public']['Enums']['delivery_platform'];
export type ModificationType = Database['public']['Enums']['modification_type'];

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Array<{ id?: string; name: string; type?: 'extra' | 'without'; price: number }>;
  [key: string]: unknown;
};

export type OrdersListResult = {
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export type OrderFilters = {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  orderNumber?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CreateOrderInput = {
  customerName?: string;
  items: OrderItem[];
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
};

export type UpdateOrderInput = {
  customerName?: string;
  items?: OrderItem[];
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  deliveryPlatform?: DeliveryPlatform | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  eventDiscountName?: string | null;
  eventDiscountPercentage?: number | null;
  eventDiscountAmount?: number | null;
  cashAmount?: number | null;
  cardAmount?: number | null;
  cashReceived?: number | null;
  changeAmount?: number | null;
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters, page?: number, limit?: number) =>
    [...orderKeys.lists(), { filters, page, limit }] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
  canceled: () => [...orderKeys.all, 'canceled'] as const,
  modified: () => [...orderKeys.all, 'modified'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useOrders(
  filters: OrderFilters & { activeFiltersKey?: string } = {},
  page = 1,
  limit = 10
) {
  const { businessId } = useBusinessContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeFiltersKey: _ignored, ...cleanFilters } = filters;

  return useQuery<OrdersListResult>({
    queryKey: orderKeys.list(cleanFilters, page, limit),
    queryFn: async () => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('business_id', businessId);

      if (cleanFilters.status) query = query.eq('status', cleanFilters.status);
      if (cleanFilters.paymentMethod) query = query.eq('payment_method', cleanFilters.paymentMethod);
      if (cleanFilters.customerName) query = query.ilike('customer_name', `%${cleanFilters.customerName}%`);
      if (cleanFilters.orderNumber) query = query.ilike('order_number', `%${cleanFilters.orderNumber}%`);
      if (cleanFilters.createdBy) query = query.eq('created_by', cleanFilters.createdBy);
      if (cleanFilters.dateFrom) query = query.gte('created_at', cleanFilters.dateFrom);
      if (cleanFilters.dateTo) query = query.lte('created_at', cleanFilters.dateTo);

      const offset = (page - 1) * limit;
      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);

      return {
        orders: data ?? [],
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        currentPage: page,
      };
    },
    enabled: !!businessId,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useOrder(id: string) {
  const { businessId } = useBusinessContext();

  return useQuery<Order>({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 30_000,
    enabled: !!id && !!businessId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { businessId } = useBusinessContext();

  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: async (input) => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();

      // Get next serial atomically — each business has independent serial starting at 1
      const { data: serial, error: serialError } = await supabase
        .rpc('get_next_order_serial', { p_business_id: businessId });
      if (serialError) throw new Error(serialError.message);

      const orderNumber = String(serial as number);

      const { data, error } = await supabase
        .from('orders')
        .insert({
          business_id: businessId,
          order_number: orderNumber,
          created_by: input.createdBy,
          customer_name: input.customerName ?? null,
          items: input.items as unknown as Database['public']['Tables']['orders']['Insert']['items'],
          total_amount: input.totalAmount,
          payment_method: input.paymentMethod,
          delivery_platform: input.deliveryPlatform ?? null,
          discount_type: input.discountType ?? null,
          discount_value: input.discountValue ?? null,
          discount_amount: input.discountAmount ?? null,
          event_discount_name: input.eventDiscountName ?? null,
          event_discount_percentage: input.eventDiscountPercentage ?? null,
          event_discount_amount: input.eventDiscountAmount ?? null,
          cash_amount: input.cashAmount ?? null,
          card_amount: input.cardAmount ?? null,
          cash_received: input.cashReceived ?? null,
          change_amount: input.changeAmount ?? null,
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { businessId } = useBusinessContext();

  return useMutation<Order, Error, { id: string; data: UpdateOrderInput }>({
    mutationFn: async ({ id, data }) => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();

      const updateData: Record<string, unknown> = {};
      if (data.customerName !== undefined) updateData.customer_name = data.customerName;
      if (data.items !== undefined) updateData.items = data.items;
      if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount;
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
      if (data.deliveryPlatform !== undefined) updateData.delivery_platform = data.deliveryPlatform;
      if (data.discountType !== undefined) updateData.discount_type = data.discountType;
      if (data.discountValue !== undefined) updateData.discount_value = data.discountValue;
      if (data.discountAmount !== undefined) updateData.discount_amount = data.discountAmount;
      if (data.eventDiscountName !== undefined) updateData.event_discount_name = data.eventDiscountName;
      if (data.eventDiscountPercentage !== undefined) updateData.event_discount_percentage = data.eventDiscountPercentage;
      if (data.eventDiscountAmount !== undefined) updateData.event_discount_amount = data.eventDiscountAmount;
      if (data.cashAmount !== undefined) updateData.cash_amount = data.cashAmount;
      if (data.cardAmount !== undefined) updateData.card_amount = data.cardAmount;
      if (data.cashReceived !== undefined) updateData.cash_received = data.cashReceived;
      if (data.changeAmount !== undefined) updateData.change_amount = data.changeAmount;

      const { data: updated, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.modified() });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { businessId } = useBusinessContext();

  return useMutation<Order, Error, { id: string; reason?: string }>({
    mutationFn: async ({ id, reason }) => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();

      // Fetch existing order first
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessId)
        .single();

      if (fetchError || !order) throw new Error(fetchError?.message ?? 'Order not found');

      // Record the cancellation
      const { error: cancelError } = await supabase.from('canceled_orders').insert({
        business_id: businessId,
        original_order_id: id,
        canceled_by: order.created_by,
        order_data: order as unknown as Database['public']['Tables']['canceled_orders']['Insert']['order_data'],
        reason: reason ?? null,
      });
      if (cancelError) throw new Error(cancelError.message);

      // Update order status
      const { data: updated, error: updateError } = await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('id', id)
        .eq('business_id', businessId)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);
      return updated;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.canceled() });
    },
  });
}

export function useCanceledOrders() {
  const { businessId } = useBusinessContext();

  return useQuery<CanceledOrder[]>({
    queryKey: orderKeys.canceled(),
    queryFn: async () => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();
      // Join via orders to scope by business
      const { data, error } = await supabase
        .from('canceled_orders')
        .select('*, orders!canceled_orders_original_order_id_fkey!inner(business_id)')
        .eq('orders.business_id', businessId)
        .order('canceled_at', { ascending: false });
      if (error) throw new Error(error.message);
      // Strip the joined orders field from the result
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return (data ?? []).map(({ orders: _o, ...rest }) => rest as CanceledOrder);
    },
    enabled: !!businessId,
  });
}

export function useModifiedOrders() {
  const { businessId } = useBusinessContext();

  return useQuery<ModifiedOrder[]>({
    queryKey: orderKeys.modified(),
    queryFn: async () => {
      if (!businessId) throw new Error('No business context');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('modified_orders')
        .select('*, orders!modified_orders_original_order_id_fkey!inner(business_id)')
        .eq('orders.business_id', businessId)
        .order('modified_at', { ascending: false });
      if (error) throw new Error(error.message);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return (data ?? []).map(({ orders: _o, ...rest }) => rest as ModifiedOrder);
    },
    enabled: !!businessId,
  });
}

export const useModifyOrder = useUpdateOrder;
export const useDeleteOrder = useCancelOrder;

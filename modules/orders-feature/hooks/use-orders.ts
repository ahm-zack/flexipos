import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderClientService } from '@/lib/order-client-service';
import type { Database } from '@/database.types';
import type { OrderFilters } from '@/lib/order-service';

// Database types
type Order = Database['public']['Tables']['orders']['Row'];
type CanceledOrder = Database['public']['Tables']['canceled_orders']['Row'];
type ModifiedOrder = Database['public']['Tables']['modified_orders']['Row'];
type CreateOrder = Database['public']['Tables']['orders']['Insert'];
type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Array<{ name: string; price: number }>;
};

// API response types
type OrdersListResult = {
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
  totalCount: number;
};



// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters, page?: number, limit?: number) =>
    [...orderKeys.lists(), { filters, page, limit }] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
  history: (id: string) => [...orderKeys.all, 'history', id] as const,
  canceled: () => [...orderKeys.all, 'canceled'] as const,
  modified: () => [...orderKeys.all, 'modified'] as const,
};

// Client service functions
const fetchOrders = async (
  filters: OrderFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<OrdersListResult> => {
  return await orderClientService.getOrders(filters, page, limit);
};

const fetchOrderById = async (id: string): Promise<Order & { cashierName?: string }> => {
  return await orderClientService.getOrderById(id);
};

// Client-side order creation data (using camelCase for better UX)
type ClientOrderData = {
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: Database['public']['Enums']['payment_method'];
  deliveryPlatform?: Database['public']['Enums']['delivery_platform'];
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  eventDiscountName?: string;
  eventDiscountPercentage?: number;
  cashAmount?: number;
  cardAmount?: number;
  cashReceived?: number;
  changeAmount?: number;
  createdBy: string;
  orderNumber: string;
};

// Convert client data to database format
const mapClientOrderToDatabase = (clientData: ClientOrderData): CreateOrder => {
  return {
    customer_name: clientData.customerName || null,
    items: clientData.items,
    total_amount: clientData.totalAmount,
    payment_method: clientData.paymentMethod,
    delivery_platform: clientData.deliveryPlatform || null,
    discount_type: clientData.discountType || null,
    discount_value: clientData.discountValue || null,
    discount_amount: clientData.discountAmount || null,
    event_discount_name: clientData.eventDiscountName || null,
    event_discount_percentage: clientData.eventDiscountPercentage || null,
    cash_amount: clientData.cashAmount || null,
    card_amount: clientData.cardAmount || null,
    cash_received: clientData.cashReceived || null,
    change_amount: clientData.changeAmount || null,
    created_by: clientData.createdBy,
    order_number: clientData.orderNumber,
  };
};

const createOrder = async (orderData: ClientOrderData): Promise<Order> => {
  const dbOrderData = mapClientOrderToDatabase(orderData);
  return await orderClientService.createOrder(dbOrderData);
};

const updateOrder = async ({
  id,
  data
}: {
  id: string;
  data: {
    customerName?: string;
    items?: OrderItem[];
    totalAmount?: number;
    status?: Database['public']['Enums']['order_status'];
  }
}): Promise<Order> => {
  const updateData: Partial<Order> = {};
  if (data.customerName !== undefined) updateData.customer_name = data.customerName;
  if (data.items !== undefined) updateData.items = data.items;
  if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount;
  if (data.status !== undefined) updateData.status = data.status;

  return await orderClientService.updateOrder(id, updateData);
};

const deleteOrder = async (id: string): Promise<void> => {
  return await orderClientService.deleteOrder(id);
};

const cancelOrder = async ({
  id,
  canceledBy,
  reason,
}: {
  id: string;
  canceledBy: string;
  reason?: string;
}) => {
  return await orderClientService.cancelOrder(id, canceledBy, reason);
};

const modifyOrder = async ({
  id,
  customerName,
  items,
  totalAmount,
}: {
  id: string;
  customerName?: string;
  items?: OrderItem[];
  totalAmount?: number;
}) => {
  // Map to database field names
  const updateData: Record<string, unknown> = {};
  if (customerName !== undefined) updateData.customer_name = customerName;
  if (items !== undefined) updateData.items = items;
  if (totalAmount !== undefined) updateData.total_amount = totalAmount;

  return await orderClientService.modifyOrder(id, updateData);
};

const fetchOrderHistory = async (id: string) => {
  return await orderClientService.getOrderHistory(id);
};

const fetchCanceledOrders = async (): Promise<CanceledOrder[]> => {
  return await orderClientService.getCanceledOrders();
};

const fetchModifiedOrders = async (): Promise<ModifiedOrder[]> => {
  return await orderClientService.getModifiedOrders();
};

// Hooks
export const useOrders = (
  filters: OrderFilters & { activeFiltersKey?: string } = {},
  page: number = 1,
  limit: number = 10
) => {
  // Add a serializable key for activeFilters if present
  const serializableFilters = {
    ...filters,
    activeFiltersKey: filters.activeFiltersKey || '',
  };
  return useQuery({
    queryKey: orderKeys.list(serializableFilters, page, limit),
    queryFn: () => fetchOrders(filters, page, limit),
    staleTime: 0, // Always consider data stale for orders (real-time updates)
    refetchOnMount: true, // Always refetch when component mounts
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrderById(id),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!id,
  });
};

export const useOrderHistory = (id: string) => {
  return useQuery({
    queryKey: orderKeys.history(id),
    queryFn: () => fetchOrderHistory(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
};

export const useCanceledOrders = () => {
  return useQuery({
    queryKey: orderKeys.canceled(),
    queryFn: fetchCanceledOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useModifiedOrders = () => {
  return useQuery({
    queryKey: orderKeys.modified(),
    queryFn: fetchModifiedOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.history(variables.id) });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.history(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.canceled() });
    },
  });
};

export const useModifyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modifyOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.history(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.modified() });
    },
  });
};

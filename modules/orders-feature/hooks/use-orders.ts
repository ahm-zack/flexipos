import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderClientService, type OrdersListResult, type OrderHistoryResult } from '@/lib/supabase-queries/order-client-service';
import type {
  Order,
  CanceledOrder,
  ModifiedOrder
} from '@/lib/orders/db-schema';
import type { OrderFilters } from '@/lib/order-service';
import type { CreateOrder, OrderItem } from '@/lib/orders';

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

const createOrder = async (orderData: CreateOrder): Promise<Order> => {
  return await orderClientService.createOrder(orderData);
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
    status?: 'completed' | 'canceled' | 'modified';
  }
}): Promise<Order> => {
  const updateData: Partial<Order> = {};
  if (data.customerName !== undefined) updateData.customerName = data.customerName;
  if (data.items !== undefined) updateData.items = data.items;
  if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount.toString();
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
}): Promise<CanceledOrder> => {
  return await orderClientService.cancelOrder(id, canceledBy, reason);
};

const modifyOrder = async ({
  id,
  modifiedBy,
  modificationType,
  customerName,
  items,
  totalAmount,
}: {
  id: string;
  modifiedBy: string;
  modificationType: 'item_added' | 'item_removed' | 'quantity_changed' | 'item_replaced' | 'multiple_changes';
  customerName?: string;
  items?: OrderItem[];
  totalAmount?: number;
}): Promise<ModifiedOrder> => {
  return await orderClientService.modifyOrder(id, {
    modifiedBy,
    modificationType,
    customerName,
    items,
    totalAmount,
  });
};

const fetchOrderHistory = async (id: string): Promise<OrderHistoryResult> => {
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
    staleTime: 1 * 60 * 1000, // 1 minute (orders change frequently)
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

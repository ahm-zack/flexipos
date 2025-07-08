import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  ApiOrder, 
  ApiOrderResponse, 
  OrdersListResult,
  ApiCanceledOrder,
  ApiModifiedOrder,
  OrderFilters 
} from '@/lib/order-service';
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

// API functions
const fetchOrders = async (
  filters: OrderFilters = {}, 
  page: number = 1, 
  limit: number = 10
): Promise<OrdersListResult> => {
  const searchParams = new URLSearchParams();
  
  if (page) searchParams.append('page', page.toString());
  if (limit) searchParams.append('limit', limit.toString());
  if (filters.status) searchParams.append('status', filters.status);
  if (filters.createdBy) searchParams.append('createdBy', filters.createdBy);
  if (filters.customerName) searchParams.append('customerName', filters.customerName);
  if (filters.orderNumber) searchParams.append('orderNumber', filters.orderNumber);
  if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
  if (filters.paymentMethod) searchParams.append('paymentMethod', filters.paymentMethod);

  const response = await fetch(`/api/orders?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch orders');
  }
  return data.data;
};

const fetchOrderById = async (id: string): Promise<ApiOrderResponse> => {
  const response = await fetch(`/api/orders/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch order');
  }
  return data.data;
};

const createOrder = async (orderData: CreateOrder): Promise<ApiOrder> => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Failed to create order (${response.status})`);
  }
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create order');
  }
  
  return data.data;
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
}): Promise<ApiOrder> => {
  const response = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update order');
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to update order');
  }
  
  return result.data;
};

const deleteOrder = async (id: string): Promise<void> => {
  const response = await fetch(`/api/orders/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete order');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete order');
  }
};

const cancelOrder = async ({
  id,
  canceledBy,
  reason,
}: {
  id: string;
  canceledBy: string;
  reason?: string;
}): Promise<ApiCanceledOrder> => {
  const response = await fetch(`/api/orders/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ canceledBy, reason }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to cancel order');
  }
  
  return data.data;
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
}): Promise<ApiModifiedOrder> => {
  const response = await fetch(`/api/orders/${id}/modify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modifiedBy,
      modificationType,
      customerName,
      items,
      totalAmount,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to modify order');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to modify order');
  }
  
  return data.data;
};

const fetchOrderHistory = async (id: string): Promise<{
  order: ApiOrderResponse;
  cancellations: ApiCanceledOrder[];
  modifications: ApiModifiedOrder[];
}> => {
  const response = await fetch(`/api/orders/${id}/history`);
  if (!response.ok) {
    throw new Error('Failed to fetch order history');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch order history');
  }
  return data.data;
};

const fetchCanceledOrders = async (): Promise<ApiCanceledOrder[]> => {
  const response = await fetch('/api/orders/canceled');
  if (!response.ok) {
    throw new Error('Failed to fetch canceled orders');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch canceled orders');
  }
  return data.data;
};

const fetchModifiedOrders = async (): Promise<ApiModifiedOrder[]> => {
  const response = await fetch('/api/orders/modified');
  if (!response.ok) {
    throw new Error('Failed to fetch modified orders');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch modified orders');
  }
  return data.data;
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

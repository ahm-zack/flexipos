import { useQuery } from '@tanstack/react-query';
import { ApiOrderResponse } from '@/lib/order-service';

export function useOrderForReceipt(orderId: string) {
  return useQuery({
    queryKey: ['order-receipt', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      const result: { success: boolean; data?: ApiOrderResponse; error?: string } = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch order');
      }
      
      return result.data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

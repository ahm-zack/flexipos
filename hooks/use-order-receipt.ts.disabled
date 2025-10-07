import { useQuery } from '@tanstack/react-query';
import { orderClientService } from '@/lib/supabase-queries/order-client-service';

export function useOrderForReceipt(orderId: string) {
  return useQuery({
    queryKey: ['order-receipt', orderId],
    queryFn: async () => {
      return await orderClientService.getOrderById(orderId);
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

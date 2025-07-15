import { orderClientService } from "@/lib/supabase-queries/order-client-service";
import { OrdersList } from "@/modules/orders-feature/components/orders-list";
import { OrdersProvider } from "@/modules/orders-feature/contexts/orders-context";
import { orderKeys } from "@/modules/orders-feature/hooks/use-orders";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function OrdersPage() {
  const queryClient = new QueryClient();

  // Use the same query key that the client hook uses
  await queryClient.prefetchQuery({
    queryKey: orderKeys.list({}, 1, 10), // Default filters, page 1, limit 10
    queryFn: async () => {
      return await orderClientService.getOrders({}, 1, 10);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersProvider>
        <OrdersList />
      </OrdersProvider>
    </HydrationBoundary>
  );
}

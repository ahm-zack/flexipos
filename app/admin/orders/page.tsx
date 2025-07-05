import { orderService } from "@/lib/order-service";
import { OrdersList } from "@/modules/orders-feature/components/orders-list";
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
      const result = await orderService.getOrders({}, 1, 10);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch orders");
      }
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersList />
    </HydrationBoundary>
  );
}

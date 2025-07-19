import { sideOrdersClientService } from "@/lib/supabase-queries/side-orders-client-service";
import { SidesManagementView } from "@/modules/sides-feature/components/sides-management-view";
import { sidesKeys } from "@/modules/sides-feature/queries/sides-keys";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function SidesManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: sidesKeys.lists(),
    queryFn: () => sideOrdersClientService.getSideOrders(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidesManagementView />
    </HydrationBoundary>
  );
}

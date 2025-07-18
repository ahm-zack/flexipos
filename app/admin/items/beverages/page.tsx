import { beveragesClientService } from "@/lib/supabase-queries/beverages-client-service";
import { BeverageManagementView } from "@/modules/beverages-feature/components/beverage-management-view";
import { beveragesKeys } from "@/modules/beverages-feature/queries/beverages-keys";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function BeveragesManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  // Pre-fetch pizzas on server for SSR hydration
  await queryClient.prefetchQuery({
    queryKey: beveragesKeys.lists(),
    queryFn: () => beveragesClientService.getBeverages(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BeverageManagementView />
    </HydrationBoundary>
  );
}

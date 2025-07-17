import { appetizersClientService } from "@/lib/supabase-queries/appetizers-client-service";
import { AppetizerManagementView } from "@/modules/appetizers-feature/components/appetizer-management-view";
import { appetizersKeys } from "@/modules/appetizers-feature/queries/appetizers-keys";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function AppetizersManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  // Pre-fetch pizzas on server for SSR hydration
  await queryClient.prefetchQuery({
    queryKey: appetizersKeys.lists(),
    queryFn: () => appetizersClientService.getAppetizers(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppetizerManagementView />
    </HydrationBoundary>
  );
}

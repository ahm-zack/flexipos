import { burgersClientService } from "@/lib/supabase-queries/burgers-client-service";
import { BurgerManagementView } from "@/modules/burgers-feature/components/burger-management-view";
import { burgerKeys } from "@/modules/burgers-feature/queries/burger-keys";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function BurgersManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  // Pre-fetch pizzas on server for SSR hydration
  await queryClient.prefetchQuery({
    queryKey: burgerKeys.lists(),
    queryFn: () => burgersClientService.getBurgers(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BurgerManagementView />
    </HydrationBoundary>
  );
}

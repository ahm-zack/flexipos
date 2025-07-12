import { SandwichCashierView } from "@/modules/sandwich-feature";
import { sandwichKeys } from "@/modules/sandwich-feature/queries/sandwich-keys";
import { sandwichClientService } from "@/lib/supabase-queries/sandwich-client-service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function SandwichMenuPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cashier context cache strategy
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false, // Menu is stable
        refetchOnMount: false, // Don't refetch if data exists
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: sandwichKeys.lists(),
    queryFn: () => sandwichClientService.getSandwiches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandwichCashierView />
    </HydrationBoundary>
  );
}

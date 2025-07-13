import { MiniPieCashierView } from "@/modules/mini-pie-feature";
import { miniPieKeys } from "@/modules/mini-pie-feature/queries/mini-pie-keys";
import { miniPieClientService } from "@/lib/supabase-queries/mini-pie-client-service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function MiniPieMenuPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Match the cashier cache strategy + longer persistence
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false, // Menu is more stable
        refetchOnMount: false, // Don't refetch if data exists
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: miniPieKeys.lists(),
    queryFn: () => miniPieClientService.getMiniPies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MiniPieCashierView />
    </HydrationBoundary>
  );
}

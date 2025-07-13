import { MiniPieManagementView } from "@/modules/mini-pie-feature";
import { miniPieKeys } from "@/modules/mini-pie-feature/queries/mini-pie-keys";
import { miniPieClientService } from "@/lib/supabase-queries/mini-pie-client-service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function MiniPiesManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Match the admin cache strategy + longer persistence
        staleTime: 10 * 60 * 1000, // 10 minutes - longer than admin strategy
        gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
        refetchOnWindowFocus: false, // Don't refetch when returning to page
        refetchOnMount: false, // Don't refetch if data exists
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: miniPieKeys.lists(),
    queryFn: () => miniPieClientService.getMiniPies(),
    staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MiniPieManagementView />
    </HydrationBoundary>
  );
}

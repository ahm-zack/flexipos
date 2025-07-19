import { shawarmasClientService } from "@/lib/supabase-queries/shawarmas-client-service";
import { ShawermaManagementView } from "@/modules/shawerma-feature/components/shawerma-management-view";
import { shawermaKeys } from "@/modules/shawerma-feature/queries/shawerma-keys";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function ShawermasManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: shawermaKeys.lists(),
    queryFn: () => shawarmasClientService.getShawarmas(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ShawermaManagementView />
    </HydrationBoundary>
  );
}

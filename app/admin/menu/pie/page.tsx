import { pieClientService } from "@/lib/supabase/client-db";
import { PieCashierView } from "@/modules/pie-feature";
import { pieKeys } from "@/modules/pie-feature/queries/pie-keys";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function PiePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: pieKeys.lists(),
    queryFn: () => pieClientService.getPies(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PieCashierView />
    </HydrationBoundary>
  );
}

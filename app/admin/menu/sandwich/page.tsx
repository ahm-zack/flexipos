import { SandwichCashierView } from "@/modules/sandwich-feature";
import { sandwichKeys } from "@/modules/sandwich-feature/queries/sandwich-keys";
import { sandwichClientService } from "@/lib/supabase-queries/sandwich-client-service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function SandwichMenuPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: sandwichKeys.lists(),
    queryFn: () => sandwichClientService.getSandwiches(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandwichCashierView />
    </HydrationBoundary>
  );
}

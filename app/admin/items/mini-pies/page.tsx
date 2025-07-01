import { miniPieService } from "@/lib/mini-pie-service";
import { MiniPieManagementView } from "@/modules/mini-pie-feature";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function MiniPiesManagementPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["mini-pies", "list"],
    queryFn: async () => {
      const result = await miniPieService.getMiniPies();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch mini pies");
      }
      return result.data;
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MiniPieManagementView />
    </HydrationBoundary>
  );
}

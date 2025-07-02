import { miniPieService } from "@/lib/mini-pie-service";
import { MiniPieCashierView } from "@/modules/mini-pie-feature";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function MiniPieMenuPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["miniPies", "list"],
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
      <MiniPieCashierView />
    </HydrationBoundary>
  );
}

import { pieService } from "@/lib/pie-service";
import { PieManagementView } from "@/modules/pie-feature";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function PiesManagementPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["pies", "list"],
    queryFn: async () => {
      const result = await pieService.getPies();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch pies");
      }
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PieManagementView />
    </HydrationBoundary>
  );
}

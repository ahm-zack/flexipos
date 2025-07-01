import { sandwichService } from "@/lib/sandwich-service";
import { SandwichManagementView } from "@/modules/sandwich-feature";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function SandwichesManagementPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["sandwiches", "list"],
    queryFn: async () => {
      const result = await sandwichService.getSandwiches();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch sandwiches");
      }
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandwichManagementView />
    </HydrationBoundary>
  );
}

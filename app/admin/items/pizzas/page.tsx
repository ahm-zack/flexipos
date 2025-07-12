import { pizzaClientService } from "@/lib/supabase/client-db";
import { PizzaManagementView, pizzaKeys } from "@/modules/pizza-feature";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function PizzasManagementPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  // Pre-fetch pizzas on server for SSR hydration
  await queryClient.prefetchQuery({
    queryKey: pizzaKeys.lists(),
    queryFn: () => pizzaClientService.getPizzas(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PizzaManagementView />
    </HydrationBoundary>
  );
}

import { PizzaCashierView } from "@/modules/pizza-feature";
import { pizzaService } from "@/lib/pizza-service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function PizzaPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["pizzas", "list"],
    queryFn: async () => {
      const result = await pizzaService.getPizzas();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch pizzas");
      }
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PizzaCashierView />
    </HydrationBoundary>
  );
}

import { Metadata } from "next";
import { PizzaCashierView, pizzaKeys } from "@/modules/pizza-feature";
import { pizzaClientService } from "@/lib/supabase/client-db";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Pizza Menu - Cashier",
  description: "Pizza ordering interface for cashiers",
};

export default async function PizzaMenuPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes for cashier menu
      },
    },
  });

  // Pre-fetch pizzas on server for menu
  await queryClient.prefetchQuery({
    queryKey: pizzaKeys.lists(),
    queryFn: () => pizzaClientService.getPizzas(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PizzaCashierView />
    </HydrationBoundary>
  );
}

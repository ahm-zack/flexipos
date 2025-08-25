import { OrdersList } from "@/modules/orders-feature/components/orders-list";
import { OrdersProvider } from "@/modules/orders-feature/contexts/orders-context";

export default async function OrdersPage() {
  return (
    <OrdersProvider>
      <OrdersList />
    </OrdersProvider>
  );
}

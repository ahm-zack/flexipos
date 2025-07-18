import { useAppetizers } from "@/modules/appetizers-feature/hooks/use-appetizers";
import { useBeverages } from "@/modules/beverages-feature/hooks/use-beverages";
import { useMiniPies } from "@/modules/mini-pie-feature/hooks/use-mini-pies-new";
import { usePies } from "@/modules/pie-feature";
import { usePizzas } from "@/modules/pizza-feature";
import { useSandwiches } from "@/modules/sandwich-feature";

export function useMenu() {
    return {
        miniPies: useMiniPies('cashier'),
        pizzas: usePizzas('cashier'),
        pies: usePies('cashier'),
        sandwiches: useSandwiches('cashier'),
        appetizers: useAppetizers('cashier'),
        beverages: useBeverages('cashier'),
    }
}
"use client";
import { useSearchStore } from "@/hooks/useSearchStore";
import { Button } from "@/components/ui/button";
import { PizzaGridSkeleton } from "@/components/ui/pizza-skeleton";
import { useAppetizers } from "../appetizers-feature/hooks/use-appetizers";
import { AppetizerGrid } from "../appetizers-feature/components/appetizer-grid";

export function AppetizersMenuPage() {
  const { data: appetizers, isLoading, error } = useAppetizers("cashier");

  const { filterAppetizers } = useSearchStore();
  const filteredAppetizers = filterAppetizers(appetizers || []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error loading appetizers
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return <PizzaGridSkeleton count={6} />;
  }

  return (
    <AppetizerGrid
      appetizers={filteredAppetizers}
      showActions={false} // No edit/delete actions in cashier view
      showCartActions={true} // Show cart actions in cashier view
      isLoading={isLoading}
    />
  );
}

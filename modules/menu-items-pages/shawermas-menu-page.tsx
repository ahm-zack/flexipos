"use client";
import { useSearchStore } from "@/hooks/useSearchStore";
import { Button } from "@/components/ui/button";
import { ShawermaGrid } from "../shawerma-feature/components/shawerma-grid";
import { useShawarmas } from "../shawerma-feature/hooks/use-shawermas";
import { PizzaGridSkeleton } from "@/components/ui/pizza-skeleton";

export function ShawermasMenuPage() {
  const { data: shawermas, isLoading, error } = useShawarmas("cashier");

  const { filterShawarma } = useSearchStore();
  const filteredShawarmas = filterShawarma(shawermas || []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error loading shawermas
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
    <ShawermaGrid
      shawermas={filteredShawarmas}
      showActions={false} // No edit/delete actions in cashier view
      showCartActions={true} // Show cart actions in cashier view
      isLoading={isLoading}
    />
  );
}

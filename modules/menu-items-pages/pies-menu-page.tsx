"use client";
import { PieGridSkeleton } from "@/components/ui/pie-skeleton";
import { PieGrid, usePies } from "@/modules/pie-feature";
import { useSearchStore } from "@/hooks/useSearchStore";
import { Button } from "@/components/ui/button";

export function PiesMenuPage() {
  const { data: pies, isLoading, error } = usePies("cashier");

  const { filterPies } = useSearchStore();
  const filteredPies = filterPies(pies || []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error loading pies
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return <PieGridSkeleton count={6} />;
  }

  return (
    <PieGrid
      pies={filteredPies}
      showActions={false} // No edit/delete actions in cashier view
      showCartActions={true} // Show cart actions in cashier view
      isLoading={isLoading}
    />
  );
}

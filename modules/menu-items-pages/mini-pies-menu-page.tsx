"use client";
import { MiniPieGridSkeleton } from "@/components/ui/mini-pie-skeleton";
import { MiniPieGrid, useMiniPies } from "@/modules/mini-pie-feature";
import { useSearchStore } from "@/hooks/useSearchStore";
import { Button } from "@/components/ui/button";

export function MiniPiesMenuPage() {
  const { data: miniPies, isLoading, error } = useMiniPies("cashier");

  const { filterMiniPies } = useSearchStore();
  const filteredMiniPies = filterMiniPies(miniPies || []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error loading mini pies
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return <MiniPieGridSkeleton count={6} />;
  }

  return (
    <MiniPieGrid
      miniPies={filteredMiniPies}
      showActions={false} // No edit/delete actions in cashier view
      showCartActions={true} // Show cart actions in cashier view
      isLoading={isLoading}
    />
  );
}

"use client";
import { MiniPieGridSkeleton } from "@/components/ui/mini-pie-skeleton";
import { MiniPieGrid, useMiniPies } from "@/modules/mini-pie-feature";
import { useSearchStore } from "../../../../hooks/useSearchStore";
import { Button } from "@/components/ui/button";
import MenuProductLayout from "../MenuProductLayout";

export default function MiniPieMenuPage() {
  const { data: miniPies, isLoading, error } = useMiniPies("cashier");

  const { filterMiniPies } = useSearchStore();
  const filteredMiniPies = filterMiniPies(miniPies || []);

  if (error) {
    return (
      <MenuProductLayout>
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
      </MenuProductLayout>
    );
  }

  if (isLoading) {
    return (
      <MenuProductLayout>
        <MiniPieGridSkeleton count={6} />
      </MenuProductLayout>
    );
  }

  return (
    <MenuProductLayout>
      <MiniPieGrid
        miniPies={filteredMiniPies}
        showActions={false} // No edit/delete actions in cashier view
        showCartActions={true} // Show cart actions in cashier view
        isLoading={isLoading}
      />
    </MenuProductLayout>
  );
}

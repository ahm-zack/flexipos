"use client";

import { MiniPieCard } from "./mini-pie-card";
import { MiniPieGridSkeleton } from "@/components/ui/mini-pie-skeleton";
import type { MiniPie } from "@/lib/db/schema";

interface MiniPieGridProps {
  miniPies: MiniPie[];
  onEdit?: (miniPie: MiniPie) => void;
  onDelete?: (miniPie: MiniPie) => void;
  showActions?: boolean;
  showCartActions?: boolean;
  isLoading?: boolean;
}

export function MiniPieGrid({
  miniPies,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
  isLoading = false,
}: MiniPieGridProps) {
  if (isLoading) {
    return <MiniPieGridSkeleton count={6} />;
  }
  if (miniPies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🥧</div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No mini pies found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or add some mini pies to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {miniPies.map((miniPie) => (
        <MiniPieCard
          key={miniPie.id}
          miniPie={miniPie}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          showCartActions={showCartActions}
        />
      ))}
    </div>
  );
}

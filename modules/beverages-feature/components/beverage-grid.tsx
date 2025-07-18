"use client";

import { BeverageCashierCard } from "./beverage-cashier-card";
import { BeverageManagementCard } from "./beverage-management-card";
import type { Beverage } from "@/lib/db/schema";

interface BeverageGridProps {
  beverages: Beverage[];
  onEdit?: (beverage: Beverage) => void;
  onDelete?: (beverage: Beverage) => void;
  showActions?: boolean;
  showCartActions?: boolean;
  isLoading?: boolean;
}

export function BeverageGrid({
  beverages,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
  isLoading = false,
}: BeverageGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg shadow-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-gray-200" />
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-24" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-8 bg-gray-200 rounded w-24" />
                <div className="h-10 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (beverages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🥤</div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No beverages found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or add some beverages to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {beverages.map((beverage) => {
        if (!showActions && showCartActions) {
          return <BeverageCashierCard key={beverage.id} beverage={beverage} />;
        } else {
          return (
            <BeverageManagementCard
              key={beverage.id}
              beverage={beverage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }
      })}
    </div>
  );
}

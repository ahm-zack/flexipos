"use client";

import { ShawermaManagementCard } from "./shawerma-management-card";
import { Shawarma } from "@/lib/db";
import { ShawermaCashierCard } from "./shawerma-cashier-card";

interface ShawermaGridProps {
  shawermas: Shawarma[];
  onEdit?: (shawerma: Shawarma) => void;
  onDelete?: (shawerma: Shawarma) => void;
  showActions?: boolean;
  showCartActions?: boolean;
  isLoading?: boolean;
}

export function ShawermaGrid({
  shawermas,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
  isLoading = false,
}: ShawermaGridProps) {
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

  if (shawermas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌯</div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No shawermas found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or add some shawermas to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {shawermas.map((shawarma) => {
        if (!showActions && showCartActions) {
          return <ShawermaCashierCard key={shawarma.id} shawarma={shawarma} />;
        } else {
          return (
            <ShawermaManagementCard
              key={shawarma.id}
              shawarma={shawarma}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }
      })}
    </div>
  );
}

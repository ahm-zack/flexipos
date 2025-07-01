"use client";

import { SandwichCard } from "./sandwich-card";
import type { Sandwich } from "@/lib/db/schema";

interface SandwichGridProps {
  sandwiches: Sandwich[];
  onEdit?: (sandwich: Sandwich) => void;
  onDelete?: (sandwich: Sandwich) => void;
  showActions?: boolean;
  showCartActions?: boolean;
  isLoading?: boolean;
}

export function SandwichGrid({
  sandwiches,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
  isLoading = false,
}: SandwichGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-video rounded-t-lg"></div>
            <div className="bg-gray-100 p-6 rounded-b-lg">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sandwiches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🥪</div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No sandwiches found
        </h3>
        <p className="text-muted-foreground">
          {showActions
            ? "Start by adding your first sandwich to the menu"
            : "Check back later for delicious sandwich options"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sandwiches.map((sandwich) => (
        <SandwichCard
          key={sandwich.id}
          sandwich={sandwich}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          showCartActions={showCartActions}
        />
      ))}
    </div>
  );
}

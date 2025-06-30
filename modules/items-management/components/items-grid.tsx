"use client";

import { ItemCard, type MenuItem } from "./item-card";

interface ItemsGridProps {
  items: MenuItem[];
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ItemsGrid({ items, onEditItem, onDeleteItem }: ItemsGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No items found.</p>
        <p className="text-muted-foreground text-sm mt-2">
          Create your first item to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
}

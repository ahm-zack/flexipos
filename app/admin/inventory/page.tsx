"use client";

import { CategorySystem } from "@/modules/product-feature";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product categories and inventory
          </p>
        </div>
      </div>

      <CategorySystem />
    </div>
  );
}

"use client";

import { CategorySystem } from "@/modules/product-feature";
import { BusinessDebugInfo } from "@/components/business-debug-info";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6">
      <BusinessDebugInfo />

      <CategorySystem />
    </div>
  );
}

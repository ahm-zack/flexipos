"use client";

import { ProductManagementCard } from "./product-management-card";
import type { Product } from "../services/product-client-service";

interface ProductGridProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
}

export function ProductGrid({
  products,
  onEdit,
  onDelete,
  onView,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No products found
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductManagementCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}

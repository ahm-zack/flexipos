"use client";

import { Button } from "@/components/ui/button";
import { ProductCashierCard } from "./product-cashier-card";
import { useSearchStore } from "@/hooks/useSearchStore";
import type { Product } from "../services/product-supabase-service";

interface ProductCashierViewProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  categoryName?: string;
}

export function ProductCashierView({
  products,
  isLoading = false,
  error,
  categoryName = "Products",
}: ProductCashierViewProps) {
  const { filterProducts } = useSearchStore();

  // Filter products using the global search store
  const filteredProducts = filterProducts(products);

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-full mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading products
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-center">
            🛍️ {categoryName} Menu
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Discover our amazing product selection
          </p>
        </div>

        {/* Product Grid - Cashier View (No management actions) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">�</div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No products found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts
              .filter((product) => product.isActive)
              .map((product) => (
                <ProductCashierCard key={product.id} product={product} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

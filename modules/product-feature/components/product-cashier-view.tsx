"use client";

import { ProductCashierCard } from "./product-cashier-card";
import type { Product } from "../services/product-client-service";

interface ProductCashierViewProps {
  products: Product[];
  onAddToCart?: (product: Product, quantity: number) => void;
  cartItems?: Record<string, number>;
  onQuantityChange?: (productId: string, quantity: number) => void;
  isLoading?: boolean;
}

export function ProductCashierView({
  products,
  onAddToCart,
  cartItems = {},
  onQuantityChange,
  isLoading = false,
}: ProductCashierViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-80 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No products available
        </h3>
        <p className="text-sm text-muted-foreground">
          Products will appear here when they are added to this category.
        </p>
      </div>
    );
  }

  // Filter only active products for cashier view
  const activeProducts = products.filter((product) => product.isActive);

  if (activeProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😴</div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          All products are currently unavailable
        </h3>
        <p className="text-sm text-muted-foreground">
          Check back later when products are available for sale.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {activeProducts.map((product) => (
        <ProductCashierCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          quantity={cartItems[product.id] || 0}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  );
}

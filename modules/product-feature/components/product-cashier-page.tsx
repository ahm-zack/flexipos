"use client";

import { useState } from "react";
import { ProductCashierView } from "./product-cashier-view";
import { useProductsByCategorySlug } from "../hooks/use-products";
import { useCategories } from "../hooks/use-categories";
import { Package, Loader2 } from "lucide-react";
import type { Product } from "../services/product-client-service";
import type { Category } from "../services/category-client-service";

const DEFAULT_BUSINESS_ID = "default-business-id";

interface ProductCashierPageProps {
  categorySlug: string;
}

export function ProductCashierPage({ categorySlug }: ProductCashierPageProps) {
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  // Fetch categories and products for the specific category
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(
    DEFAULT_BUSINESS_ID,
    "cashier"
  );
  const { data: categoryData, isLoading: productsLoading } =
    useProductsByCategorySlug(DEFAULT_BUSINESS_ID, categorySlug, "cashier");

  // Extract products and category from the response
  const categoryProducts = categoryData?.products || [];
  const currentCategory =
    categoryData?.category ||
    categories.find((cat: Category) => cat.slug === categorySlug);

  // Cart functionality
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + quantity,
    }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [productId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setCartItems((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Category not found
  if (!currentCategory) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Category Not Found</h3>
          <p className="text-muted-foreground">
            The category &ldquo;{categorySlug}&rdquo; doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // No products
  if (categoryProducts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No products in {currentCategory.name}
          </h3>
          <p className="text-muted-foreground">
            No items have been added to this category yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ProductCashierView
        products={categoryProducts}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
        onQuantityChange={handleQuantityChange}
      />
    </div>
  );
}

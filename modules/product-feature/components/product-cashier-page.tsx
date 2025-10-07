"use client";

import { ProductCashierView } from "./product-cashier-view";
import { useProductsByCategorySlug } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Package, Loader2 } from "lucide-react";
import type { Category } from "../services/category-supabase-service";

const DEFAULT_BUSINESS_ID = "b1234567-89ab-cdef-0123-456789abcdef";

interface ProductCashierPageProps {
  categorySlug: string;
}

export function ProductCashierPage({ categorySlug }: ProductCashierPageProps) {
  // Fetch categories and products for the specific category
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories(DEFAULT_BUSINESS_ID);
  const { data: categoryProducts = [], isLoading: productsLoading } =
    useProductsByCategorySlug(categorySlug, DEFAULT_BUSINESS_ID);

  // Find the current category
  const currentCategory = categories.find(
    (cat: Category) => cat.slug === categorySlug
  );

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
    <ProductCashierView
      products={categoryProducts}
      isLoading={productsLoading}
      categoryName={currentCategory?.name || categorySlug}
    />
  );
}

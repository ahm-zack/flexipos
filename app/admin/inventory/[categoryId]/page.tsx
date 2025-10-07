"use client";

import { use } from "react";
import { ProductManagementView } from "@/modules/product-feature/components/product-management-view";
import { useProductsByCategory } from "@/modules/product-feature/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { categorySupabaseService } from "@/modules/product-feature/services/category-supabase-service";

export default function CategoryInventoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);

  // Get business ID (in a real app, this would come from auth context)
  const businessId = "b1234567-89ab-cdef-0123-456789abcdef";

  // Fetch category information by ID
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      console.log("Fetching category with ID:", categoryId);
      const result = await categorySupabaseService.getCategory(categoryId);
      console.log("Category fetch result:", result);
      return result;
    },
    enabled: !!categoryId,
  });

  // Fetch products for this category using the category ID once we have it
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProductsByCategory(businessId, category?.id || "");

  const isLoading = categoryLoading || productsLoading;
  const error = categoryError || productsError;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Category
          </h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Debug what we're passing
  console.log("CategoryName Debug:", {
    categoryId,
    category,
    categoryName: category?.name || `Category ${categoryId}`,
    categoryIdFromData: category?.id,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductManagementView
        products={products}
        categoryName={category?.name || `Category ${categoryId}`}
        businessId={businessId}
        categoryId={category?.id || categoryId}
        isLoading={isLoading}
      />
    </div>
  );
}

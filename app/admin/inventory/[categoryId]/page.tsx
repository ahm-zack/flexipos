"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ProductManagementView } from "@/modules/product-feature/components/product-management-view";
import { useProductsByCategory } from "@/modules/product-feature/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { categorySupabaseService } from "@/modules/product-feature/services/category-supabase-service";
import { useBusinessId } from "@/hooks/useBusinessId";

export default function CategoryInventoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const t = useTranslations("menu");
  const { categoryId } = use(params);
  const { businessId } = useBusinessId(); // Now uses authenticated user's businessId from context

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
            {t("errorLoadingCategory")}
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

  if (!businessId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t("errorLoadingBusiness")}
          </h1>
          <p className="text-muted-foreground">{t("businessIdNotFound")}</p>
        </div>
      </div>
    );
  }

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

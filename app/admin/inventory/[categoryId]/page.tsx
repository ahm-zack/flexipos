"use client";

import { useParams } from "next/navigation";
import { ProductManagementView } from "@/modules/product-feature/components/product-management-view";
import { useProductsByCategory } from "@/modules/product-feature/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryInventoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  // Get business ID (in a real app, this would come from auth context)
  const businessId = "b1234567-89ab-cdef-0123-456789abcdef";

  // Fetch products for this category
  const {
    data: products = [],
    isLoading,
    error,
  } = useProductsByCategory(businessId, categoryId);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Products
          </h1>
          <p className="text-muted-foreground">{error.message}</p>
          <Link href="/admin/inventory">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">
            Product Management - {categoryId}
          </h1>
          <p className="text-muted-foreground">
            Manage products in this category ({products.length} products)
          </p>
        </div>
      </div>

      {/* Product Management View */}
      <ProductManagementView
        products={products}
        categoryName={`Category ${categoryId}`}
        onCreateNew={() =>
          console.log("Create product for category:", categoryId)
        }
        onEdit={(product) => console.log("Edit product:", product)}
        onDelete={(productId) => console.log("Delete product:", productId)}
        onView={(product) => console.log("View product:", product)}
        isLoading={isLoading}
      />
    </div>
  );
}

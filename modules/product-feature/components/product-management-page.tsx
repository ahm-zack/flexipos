"use client";

import { useState } from "react";
import { ProductManagementView } from "./product-management-view";
import { CreateProductForm } from "./create-product-form";
import { EditProductForm } from "./edit-product-form";
import { useProductsByCategorySlug } from "../hooks/use-products";
import { useCategories } from "../hooks/use-categories";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/use-products";
import { Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product, NewProduct } from "../services/product-client-service";
import type { Category } from "../services/category-client-service";

const DEFAULT_BUSINESS_ID = "default-business-id";

interface ProductManagementPageProps {
  categorySlug: string;
}

export function ProductManagementPage({
  categorySlug,
}: ProductManagementPageProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch categories and products for the specific category
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(
    DEFAULT_BUSINESS_ID,
    "admin"
  );
  const {
    data: categoryData,
    isLoading: productsLoading,
    refetch,
  } = useProductsByCategorySlug(DEFAULT_BUSINESS_ID, categorySlug, "admin");

  // Extract products and category from the response
  const categoryProducts = categoryData?.products || [];
  const currentCategory =
    categoryData?.category ||
    categories.find((cat: Category) => cat.slug === categorySlug);

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Handlers
  const handleCreateProduct = () => {
    setShowCreateForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductMutation.mutateAsync(productId);
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCreateSubmit = async (productData: NewProduct) => {
    try {
      await createProductMutation.mutateAsync(productData);
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleEditSubmit = async (
    productId: string,
    productData: Partial<NewProduct>
  ) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        ...productData,
      });
      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleView = (product: Product) => {
    // Navigate to product detail page or open modal
    console.log("View product:", product);
  };

  const handleBack = () => {
    router.push("/admin/items");
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
          <Button variant="outline" onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <div className="p-6">
        <CreateProductForm
          categories={categories}
          selectedCategoryId={currentCategory.id}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={createProductMutation.isPending}
        />
      </div>
    );
  }

  // Show edit form
  if (editingProduct) {
    return (
      <div className="p-6">
        <EditProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingProduct(null)}
          isSubmitting={updateProductMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">
            {currentCategory.name} Products
          </h1>
        </div>
      </div>

      <ProductManagementView
        products={categoryProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreateNew={handleCreateProduct}
        categoryName={currentCategory.name}
        isLoading={productsLoading}
      />
    </div>
  );
}

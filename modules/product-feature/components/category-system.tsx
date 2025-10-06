"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Trash2, Grid3X3 } from "lucide-react";
import { type Category } from "../services/category-supabase-service";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { CategoryForm } from "./category-form";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onClick: (categoryId: string) => void;
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
      onClick={() => onClick(category.id)}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: category.color || "#6366f1" }}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: category.color || "#6366f1" }}
            >
              {category.icon ? (
                <span>{category.icon}</span>
              ) : (
                <Package className="w-6 h-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {category.name}
              </CardTitle>
              {category.nameAr && (
                <p className="text-sm text-muted-foreground">
                  {category.nameAr}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {category.description && (
          <CardDescription className="text-sm line-clamp-2">
            {category.description}
          </CardDescription>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between">
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Grid3X3 className="w-4 h-4" />
          <span>View Products</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export function CategorySystem() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Use the categories hook for data fetching
  const { data: categories = [], isLoading, error, refetch } = useCategories();

  // Use mutation hooks for CRUD operations
  const deleteCategoryMutation = useDeleteCategory();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/admin/inventory/${categoryId}`);
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = (category: Category) => {
    console.log("Category saved successfully:", category);
    // The cache will be updated automatically by the hooks
  };

  const handleDeleteClick = (category: Category) => {
    if (
      window.confirm(
        `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
      )
    ) {
      handleDeleteConfirm(category);
    }
  };

  const handleDeleteConfirm = async (category: Category) => {
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      console.log(`Category "${category.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Categories
          </h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error
              ? error.message
              : "Failed to load categories"}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Product Categories
          </h2>
          <p className="text-muted-foreground">
            Organize your products by categories. Click on a category to manage
            its products.
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-5 bg-muted rounded w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first product category.
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      )}

      {/* Category Form Dialog */}
      <CategoryForm
        category={editingCategory}
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

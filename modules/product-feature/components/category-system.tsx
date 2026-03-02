"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  ChevronRight,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import { type Category } from "../services/category-supabase-service";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { CategoryForm } from "./category-form";
import { toast } from "sonner";

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
  const t = useTranslations("menu");
  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/60"
      onClick={() => onClick(category.id)}
    >
      {/* Top colour accent */}
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-lg"
        style={{ backgroundColor: category.color || "#6366f1" }}
      />

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl shadow-sm shrink-0"
              style={{ backgroundColor: category.color || "#6366f1" }}
            >
              {category.icon ? (
                <span>{category.icon}</span>
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors truncate">
                {category.name}
              </CardTitle>
              {category.nameAr && (
                <p
                  className="text-xs text-muted-foreground mt-0.5 truncate"
                  dir="rtl"
                >
                  {category.nameAr}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {category.description && (
        <CardContent className="py-1 px-6">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        </CardContent>
      )}

      <CardFooter className="pt-3 pb-4 px-6 flex items-center justify-between">
        <Badge
          variant={category.isActive ? "default" : "secondary"}
          className="text-xs"
        >
          {category.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
          <span>{t("viewProducts")}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </CardFooter>
    </Card>
  );
}

function CategorySkeletonCard() {
  return (
    <Card className="overflow-hidden animate-pulse border-border/60">
      <div className="h-1 bg-muted rounded-t-lg" />
      <CardHeader className="pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-muted rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-3 pb-4">
        <div className="h-5 bg-muted rounded w-14" />
      </CardFooter>
    </Card>
  );
}

export function CategorySystem() {
  const router = useRouter();
  const t = useTranslations("menu");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading, error, refetch } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();

  const activeCount = categories.filter((c) => c.isActive).length;

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/admin/inventory/${categoryId}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategoryMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch {
      toast.error(t("toasts.deleteCategoryFailed"));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {t("failedLoadCategories")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t("unexpectedError")}
        </p>
        <Button onClick={() => refetch()}>{t("tryAgain")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            {t("productCategories")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? t("loading")
              : t("categorySummary", {
                  count: categories.length,
                  active: activeCount,
                })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("newCategory")}
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <CategorySkeletonCard key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{t("noCategoriesYet")}</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            {t("noCategoriesHint")}
          </p>
          <Button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("createFirstCategory")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={(c) => {
                setEditingCategory(c);
                setShowForm(true);
              }}
              onDelete={setDeleteTarget}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      )}

      {/* Category Form */}
      <CategoryForm
        category={editingCategory}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(null);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              {t("confirmDeleteCategoryTitle", {
                name: deleteTarget?.name ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteCategoryDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteCategoryMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

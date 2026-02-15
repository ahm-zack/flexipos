"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type Category,
  type NewCategory,
} from "../services/category-supabase-service";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { useBusinessId } from "@/hooks/useBusinessId";

interface CategoryFormProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
}

const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#84cc16", // lime
];

const DEFAULT_ICONS = [
  "🍕",
  "🥧",
  "🍔",
  "🥪",
  "🍟",
  "🍗",
  "🥗",
  "🍰",
  "☕",
  "🥤",
  "🍺",
  "🍷",
  "🍎",
  "🥐",
  "🧀",
  "🍖",
];

export function CategoryForm({
  category,
  isOpen,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const isEdit = !!category;
  const {
    businessId,
    isLoading: businessLoading,
    error: businessError,
  } = useBusinessId();

  const [formData, setFormData] = useState<Partial<NewCategory>>(() => ({
    name: category?.name || "",
    nameAr: category?.nameAr || "",
    description: category?.description || "",
    icon: category?.icon || "📦",
    color: category?.color || "#6366f1",
    displayOrder: category?.displayOrder || 0,
    isActive: category?.isActive ?? true,
    slug: category?.slug || "",
    businessId: category?.businessId || businessId || undefined,
    parentCategoryId: category?.parentCategoryId || null,
    metadata: category?.metadata || {},
  }));

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert("Category name is required");
      return;
    }

    // Validate businessId is available
    if (!businessId) {
      alert(
        "Business information not loaded. Please refresh the page and try again.",
      );
      return;
    }

    // Ensure businessId is set
    const dataToSubmit = {
      ...formData,
      businessId: businessId, // Use the validated businessId
    };

    // Generate slug if not provided
    if (!dataToSubmit.slug) {
      dataToSubmit.slug = dataToSubmit
        .name!.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
    }

    console.log(
      "Submitting category with businessId:",
      dataToSubmit.businessId,
    );

    try {
      if (isEdit && category) {
        const updatedCategory = await updateMutation.mutateAsync({
          id: category.id,
          data: dataToSubmit as Partial<NewCategory>,
        });
        onSuccess?.(updatedCategory);
      } else {
        const newCategory = await createMutation.mutateAsync(
          dataToSubmit as NewCategory,
        );
        console.log("Category created successfully:", newCategory);
        onSuccess?.(newCategory);
      }
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(
        `Failed to save category: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleChange = (
    field: keyof NewCategory,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category information below."
              : "Add a new category to organize your products."}
          </DialogDescription>
        </DialogHeader>

        {businessError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            ⚠️ {businessError} - Unable to create category without business
            information.
          </div>
        )}

        {businessLoading && (
          <div className="text-sm text-muted-foreground">
            Loading business information...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name</Label>
              <Input
                id="nameAr"
                value={formData.nameAr || ""}
                onChange={(e) => handleChange("nameAr", e.target.value)}
                placeholder="Enter Arabic name"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) =>
                  handleChange("displayOrder", parseInt(e.target.value) || 0)
                }
                min="0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={formData.icon === icon ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("icon", icon)}
                    className="text-lg"
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange("color", color)}
                    className="w-8 h-8 p-0 border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: formData.color === color ? "#000" : color,
                    }}
                  >
                    <span className="sr-only">{color}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !businessId ||
                businessLoading ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Update Category"
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

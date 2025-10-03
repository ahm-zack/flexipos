"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { NewProduct } from "../services/product-client-service";
import type { Category } from "../services/category-client-service";

interface CreateProductFormProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSubmit: (productData: NewProduct) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateProductForm({
  categories,
  selectedCategoryId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreateProductFormProps) {
  const [formData, setFormData] = useState<NewProduct>({
    businessId: "default-business-id", // This should come from auth context
    categoryId: selectedCategoryId || "",
    name: "",
    nameAr: "",
    description: "",
    sku: "",
    barcode: "",
    price: 0,
    images: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    stockQuantity: undefined,
    metadata: {},
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Product</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter product name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameAr">Product Name (Arabic)</Label>
              <Input
                id="nameAr"
                value={formData.nameAr || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                }
                placeholder="Enter Arabic name"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  errors.categoryId ? "border-destructive" : ""
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background resize-none"
              />
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="Product SKU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      barcode: e.target.value,
                    }))
                  }
                  placeholder="Product barcode"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Product is available for sale
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight this product
                </p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked }))
                }
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

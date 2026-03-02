"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getReliableImageUrl } from "@/lib/image-utils";
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
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { SaudiRiyalSymbol } from "@/components/currency";
import { useUpdateProduct } from "../hooks/useProducts";
import { uploadMenuImage, deleteMenuImage } from "@/lib/image-upload";
import type { Product, NewProduct } from "../services/product-supabase-service";
import { ModifierManager } from "@/components/modifier-manager";

interface EditProductFormProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductForm({
  product,
  open,
  onOpenChange,
}: EditProductFormProps) {
  const [formData, setFormData] = useState<Partial<NewProduct>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const updateProductMutation = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        price: product.price,
        sku: product.sku,
        barcode: product.barcode,
        stockQuantity: product.stockQuantity,
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: product.images,
        tags: product.tags,
        modifiers: product.modifiers,
      });
      setSelectedFile(null);
      setPreviewUrl("");
    }
  }, [product]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const removeImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, images: [] }));
    const fileInput = document.getElementById(
      "editProductImageFile",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let images = formData.images ?? [];
      const oldImageUrl = product.images?.[0];

      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadMenuImage(selectedFile);
          if (uploadedUrl) {
            images = [uploadedUrl];
          } else {
            toast.error("Failed to upload image");
            setIsUploading(false);
            return;
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const updates = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        images,
      };

      await updateProductMutation.mutateAsync({ id: product.id, updates });

      // Clean up old storage file if image was replaced or removed
      if (oldImageUrl && oldImageUrl !== images[0]) {
        deleteMenuImage(oldImageUrl).catch((err) =>
          console.warn("Could not delete old product image:", err),
        );
      }

      toast.success("Product updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  if (!product) return null;

  const existingImage = formData.images?.[0];
  const displayPreview =
    previewUrl ||
    (existingImage ? getReliableImageUrl(existingImage, "product") : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update your product information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (English) *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameAr">Name (Arabic)</Label>
              <Input
                id="nameAr"
                value={formData.nameAr || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                }
                placeholder="اسم المنتج"
                dir="rtl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
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
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SaudiRiyalSymbol
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  required
                  className="pl-8"
                />
              </div>
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
                    stockQuantity: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>
          </div>

          {/* SKU & Barcode */}
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

          {/* Product Image */}
          <div className="space-y-2">
            <Label htmlFor="editProductImageFile">Product Image</Label>
            <div className="space-y-3">
              <Input
                id="editProductImageFile"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />

              {displayPreview ? (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={displayPreview}
                    alt="Product preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New Image
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modifiers */}
          <div className="space-y-2">
            <Label>Modifiers</Label>
            <ModifierManager
              modifiers={(formData.modifiers || []).map((mod) => ({
                id: mod.id,
                name: mod.name,
                type: mod.type === "single" ? "extra" : "without",
                price: mod.options?.[0]?.price || 0,
              }))}
              onModifiersChange={(modifiers) => {
                const productModifiers = modifiers.map((mod) => ({
                  id: mod.id,
                  name: mod.name,
                  nameAr: mod.name,
                  type: "single" as const,
                  isRequired: false,
                  maxSelections: 1,
                  minSelections: 0,
                  options: [
                    {
                      id: mod.id + "_option",
                      name: mod.name,
                      nameAr: mod.name,
                      price: mod.price,
                      isDefault: false,
                      isActive: true,
                      metadata: {},
                    },
                  ],
                  displayOrder: 0,
                  isActive: true,
                  metadata: {},
                }));
                setFormData((prev) => ({
                  ...prev,
                  modifiers: productModifiers,
                }));
              }}
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked }))
                }
              />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || updateProductMutation.isPending}
            >
              {isUploading
                ? "Uploading..."
                : updateProductMutation.isPending
                  ? "Saving..."
                  : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
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
import { useCreateProduct } from "../hooks/useProducts";
import { uploadMenuImage } from "@/lib/image-upload";
import type { NewProduct } from "../services/product-supabase-service";
import { ModifierManager } from "@/components/modifier-manager";

interface CreateProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  categoryId?: string;
}

export function CreateProductForm({
  open,
  onOpenChange,
  businessId,
  categoryId,
}: CreateProductFormProps) {
  const t = useTranslations("menu");
  const [formData, setFormData] = useState<Omit<NewProduct, "businessId">>({
    categoryId: categoryId || "",
    name: "",
    nameAr: "",
    description: "",
    price: 0,
    sku: "",
    barcode: "",
    images: [],
    variants: [],
    modifiers: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    stockQuantity: 0,
    metadata: {},
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const createProductMutation = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nameAr || !formData.price) {
      toast.error(t("toasts.requiredFields"));
      return;
    }

    try {
      let imageUrl = "";

      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadMenuImage(selectedFile, "products");
          imageUrl = uploadedUrl || "";
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error(t("toasts.uploadFailed"));
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const productData = {
        ...formData,
        businessId,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        images: imageUrl ? [imageUrl] : [],
      };

      await createProductMutation.mutateAsync(productData);

      toast.success(t("toasts.createSuccess"), {
        description: t("toasts.createSuccessDesc"),
      });

      // Reset form
      setFormData({
        categoryId: categoryId || "",
        name: "",
        nameAr: "",
        description: "",
        price: 0,
        sku: "",
        barcode: "",
        images: [],
        variants: [],
        modifiers: [],
        tags: [],
        isActive: true,
        isFeatured: false,
        stockQuantity: 0,
        metadata: {},
      });
      setSelectedFile(null);
      setPreviewUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(t("toasts.createFailed"));
    }
  };

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(t("toasts.imageRequired"));
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(t("toasts.imageTooLarge"));
          return;
        }

        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const removeImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, images: [] }));

    // Reset file input
    const fileInput = document.getElementById(
      "createProductImageFile",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createNewProduct")}</DialogTitle>
          <DialogDescription>
            {t("addToInventoryDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* English Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("labelEnglishNameRequired")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("productNamePlaceholder")}
                required
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">{t("labelArabicNameRequired")}</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                }
                placeholder={t("productNameArPlaceholder")}
                dir="rtl"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="createProductImageFile">
                {t("productImageOptional")}
              </Label>
              <div className="space-y-3">
                <Input
                  id="createProductImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />

                {/* Image Preview */}
                {(previewUrl ||
                  (formData.images && formData.images.length > 0)) && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={
                        previewUrl ||
                        getReliableImageUrl(
                          (formData.images || [])[0],
                          "product",
                        )
                      }
                      alt={t("productPreview")}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                        title={t("removeImage")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Indicator for new image */}
                    {selectedFile && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Instructions */}
                {!previewUrl &&
                  !(formData.images && formData.images.length > 0) && (
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t("descriptionPlaceholder")}
                rows={3}
              />
            </div>

            {/* Price */}
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
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder={t("pricePlaceholder")}
                  required
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Modifier prices are separate and will be added to this
                base price during checkout.
              </p>
            </div>

            {/* SKU and Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">{t("sku")}</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder={t("skuPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">{t("stockQuantity")}</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder={t("stockQtyPlaceholder")}
                />
              </div>
            </div>

            {/* Additional Fields */}
            <div className="space-y-2">
              <Label htmlFor="barcode">{t("barcode")}</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                }
                placeholder={t("barcodePlaceholder")}
              />
            </div>

            {/* Modifiers */}
            <div className="space-y-2">
              <Label>{t("modifiers")}</Label>
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

            {/* Active/Featured Switches */}
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="isActive">{t("labelActive")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                />
                <Label htmlFor="isFeatured">{t("labelFeatured")}</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  {t("uploading")}
                </>
              ) : createProductMutation.isPending ? (
                t("creating")
              ) : (
                t("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getReliableImageUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useUpdateBurger } from "../hooks/use-burgers";
import { uploadMenuImage } from "@/lib/image-upload";
import type { Burger, UpdateBurger, Modifier } from "@/lib/schemas";
import { ModifierManager } from "@/components/modifier-manager";

interface EditBurgerFormProps {
  burger: Burger | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBurgerForm({
  burger,
  open,
  onOpenChange,
}: EditBurgerFormProps) {
  const [formData, setFormData] = useState<UpdateBurger>({
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    priceWithVat: "",
    modifiers: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const updateBurgerMutation = useUpdateBurger();

  useEffect(() => {
    if (burger) {
      setFormData({
        nameAr: burger.nameAr,
        nameEn: burger.nameEn,
        imageUrl: burger.imageUrl || "",
        priceWithVat: burger.priceWithVat,
        modifiers: burger.modifiers || [],
      });
      setPreviewUrl(burger.imageUrl || "");
      setSelectedFile(null);
    }
  }, [burger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !burger ||
      !formData.nameEn ||
      !formData.nameAr ||
      !formData.priceWithVat
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = formData.imageUrl || "";
      if (selectedFile) {
        const uploadedUrl = await uploadMenuImage(selectedFile, "burgers");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.warning(
            "Image upload failed, but burger will be updated with existing data"
          );
        }
      }
      const burgerData: UpdateBurger = { ...formData, imageUrl };
      await updateBurgerMutation.mutateAsync({
        id: burger.id,
        data: burgerData,
      });
      toast.success("Burger updated successfully!");
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update burger");
      console.error("Error updating burger:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateBurger,
    value: string | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearExistingImage = () => {
    setPreviewUrl("");
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    const fileInput = document.getElementById(
      "editBurgerImageFile"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleModifiersChange = useCallback((modifiers: Modifier[]) => {
    queueMicrotask(() => setFormData((f) => ({ ...f, modifiers })));
  }, []);

  if (!burger) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Burger</DialogTitle>
          <DialogDescription>
            Update the details for &quot;{burger.nameEn}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* English Name */}
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name *</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleInputChange("nameEn", e.target.value)}
                placeholder="e.g., Cheeseburger"
              />
            </div>
            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange("nameAr", e.target.value)}
                placeholder="e.g., برجر جبنة"
                dir="rtl"
              />
            </div>
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="editBurgerImageFile">
                Burger Image (Optional)
              </Label>
              <div className="space-y-3">
                <Input
                  id="editBurgerImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {(previewUrl || formData.imageUrl) && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={
                        previewUrl ||
                        getReliableImageUrl(formData.imageUrl || "", "burgers")
                      }
                      alt="Burger preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={clearExistingImage}
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
                )}
              </div>
            </div>

            {/* Upload Instructions */}
            {!previewUrl && (
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

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (SAR) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceWithVat}
                onChange={(e) =>
                  handleInputChange("priceWithVat", e.target.value)
                }
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Note: Modifier prices are separate and will be added to this
                base price during checkout.
              </p>
            </div>
            {/* Modifiers */}
            <div className="space-y-2">
              <Label>Modifiers</Label>
              <ModifierManager
                modifiers={formData.modifiers || []}
                onModifiersChange={handleModifiersChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateBurgerMutation.isPending || isUploading}
            >
              {isUploading
                ? "Updating..."
                : updateBurgerMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

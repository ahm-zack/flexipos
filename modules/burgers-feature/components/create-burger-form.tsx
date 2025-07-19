"use client";

import { useState, useCallback } from "react";
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
import { useCreateBurger } from "../hooks/use-burgers";
import { uploadMenuImage } from "@/lib/image-upload";
import type { CreateBurger, Modifier } from "@/lib/schemas";
import { ModifierManager } from "@/components/modifier-manager";

interface CreateBurgerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBurgerForm({
  open,
  onOpenChange,
}: CreateBurgerFormProps) {
  const [formData, setFormData] = useState<CreateBurger>({
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    priceWithVat: "",
    modifiers: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const createBurgerMutation = useCreateBurger();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr || !formData.nameEn || !formData.priceWithVat) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadMenuImage(selectedFile, "burgers");
          imageUrl = uploadedUrl || "";
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      await createBurgerMutation.mutateAsync({
        ...formData,
        imageUrl,
        priceWithVat: formData.priceWithVat,
      });

      toast.success("Burger created successfully! 🍔", {
        description: "The burger will appear in the list automatically",
      });

      setFormData({
        nameAr: "",
        nameEn: "",
        imageUrl: "",
        priceWithVat: "",
        modifiers: [],
      });
      setSelectedFile(null);
      setPreviewUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating burger:", error);
      toast.error("Failed to create burger");
    }
  };

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
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const removeImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    const fileInput = document.getElementById(
      "createBurgerImageFile"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, []);

  const updateModifiers = useCallback((modifiers: Modifier[]) => {
    setFormData((prev) => ({ ...prev, modifiers }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Burger</DialogTitle>
          <DialogDescription>
            Add a new burger to your menu. All fields marked with * are
            required.
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                }
                placeholder="e.g., Cheeseburger"
                required
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                }
                placeholder="e.g., برجر جبنة"
                dir="rtl"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="createBurgerImageFile">
                Burger Image (Optional)
              </Label>
              <div className="space-y-3">
                <Input
                  id="createBurgerImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />

                {(previewUrl || formData.imageUrl) && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={
                        previewUrl ||
                        getReliableImageUrl(formData.imageUrl, "burgers")
                      }
                      alt="Burger preview"
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
                )}

                {!previewUrl && !formData.imageUrl && (
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

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="priceWithVat">Price (SAR) *</Label>
              <Input
                id="priceWithVat"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceWithVat}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceWithVat: e.target.value,
                  }))
                }
                placeholder="0.00"
                required
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
                modifiers={formData.modifiers}
                onModifiersChange={updateModifiers}
              />
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
              disabled={createBurgerMutation.isPending || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : createBurgerMutation.isPending ? (
                "Creating..."
              ) : (
                "Create Burger"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

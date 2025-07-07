"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getReliableImageUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useUpdateMiniPie } from "../hooks/use-mini-pies";
import { uploadMenuImage } from "@/lib/image-upload";
import { ModifierManager } from "@/components/modifier-manager";
import type { MiniPie } from "@/lib/db/schema";
import type { EditMiniPieFormData } from "@/lib/schemas";

interface EditMiniPieFormProps {
  miniPie: MiniPie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMiniPieForm({
  miniPie,
  open,
  onOpenChange,
}: EditMiniPieFormProps) {
  const [formData, setFormData] = useState<EditMiniPieFormData>({
    id: miniPie.id,
    type: miniPie.type,
    nameAr: miniPie.nameAr,
    nameEn: miniPie.nameEn,
    size: miniPie.size,
    priceWithVat: miniPie.priceWithVat,
    imageUrl: miniPie.imageUrl || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(miniPie.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const updateMiniPieMutation = useUpdateMiniPie();

  // Update form data when miniPie prop changes
  useEffect(() => {
    if (miniPie) {
      setFormData({
        id: miniPie.id,
        type: miniPie.type,
        nameAr: miniPie.nameAr,
        nameEn: miniPie.nameEn,
        size: miniPie.size,
        priceWithVat: miniPie.priceWithVat,
        imageUrl: miniPie.imageUrl || "",
      });
      setPreviewUrl(miniPie.imageUrl || "");
      setSelectedFile(null);
    }
  }, [miniPie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn || !formData.nameAr || !formData.priceWithVat) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = miniPie?.imageUrl || "";

      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadMenuImage(selectedFile, "mini-pies");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          console.warn("Image upload failed, continuing with existing image");
          toast.warning(
            "Image upload failed, but mini pie will be updated with existing image"
          );
        }
      }

      // Create update data
      const updateData: EditMiniPieFormData = {
        ...formData,
        imageUrl,
      };

      await updateMiniPieMutation.mutateAsync({
        id: miniPie.id,
        data: updateData,
      });

      toast.success("Mini pie updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update mini pie");
      console.error("Error updating mini pie:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof EditMiniPieFormData,
    value: string | undefined
  ) => {
    setFormData((prev: EditMiniPieFormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
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
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    // Reset file input
    const fileInput = document.getElementById(
      "editImageFile"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mini Pie</DialogTitle>
          <DialogDescription>
            Update the mini pie details below. Make your changes and click save.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Mini Pie Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Mini Pie Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mini pie type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mini Spinach Pie">
                    Mini Spinach Pie
                  </SelectItem>
                  <SelectItem value="Mini Meat Pie (Ba'lakiya style)">
                    Mini Meat Pie (Ba&apos;lakiya style)
                  </SelectItem>
                  <SelectItem value="Mini Halloumi Cheese Pie">
                    Mini Halloumi Cheese Pie
                  </SelectItem>
                  <SelectItem value="Mini Hot Dog Pie">
                    Mini Hot Dog Pie
                  </SelectItem>
                  <SelectItem value="Mini Pizza Pie">Mini Pizza Pie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name *</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleInputChange("nameEn", e.target.value)}
                placeholder="e.g., Classic Mini Spinach Pie"
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange("nameAr", e.target.value)}
                placeholder="e.g., فطيرة سبانخ صغيرة كلاسيكية"
                dir="rtl"
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => handleInputChange("size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="editImageFile">Mini Pie Image</Label>
              <div className="space-y-3">
                <Input
                  id="editImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />

                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={getReliableImageUrl(previewUrl, "mini-pie")}
                      alt="Mini pie preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Instructions */}
                {!previewUrl && (
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
              <ModifierManager itemId={miniPie.id} itemType="mini_pie" />
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
              disabled={updateMiniPieMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : updateMiniPieMutation.isPending
                ? "Updating..."
                : "Update Mini Pie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

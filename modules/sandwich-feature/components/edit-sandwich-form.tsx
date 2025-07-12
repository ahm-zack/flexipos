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
import { useUpdateSandwich } from "../hooks/use-sandwiches";
import { uploadMenuImage } from "@/lib/image-upload";
import { ModifierManager } from "@/components/modifier-manager";
import type { Sandwich } from "@/lib/db/schema";
import type { EditSandwichFormData, Modifier } from "@/lib/schemas";

interface EditSandwichFormProps {
  sandwich: Sandwich | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSandwichForm({
  sandwich,
  open,
  onOpenChange,
}: EditSandwichFormProps) {
  const [formData, setFormData] = useState<EditSandwichFormData>({
    id: "",
    type: "Beef Sandwich with Cheese",
    size: "medium",
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    priceWithVat: "",
    modifiers: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const updateSandwichMutation = useUpdateSandwich();

  // Update form data when sandwich changes
  useEffect(() => {
    if (sandwich) {
      setFormData({
        id: sandwich.id,
        type: sandwich.type,
        size: sandwich.size,
        nameAr: sandwich.nameAr,
        nameEn: sandwich.nameEn,
        imageUrl: sandwich.imageUrl || "",
        priceWithVat: sandwich.priceWithVat,
        modifiers: sandwich.modifiers || [],
      });

      // Set preview to existing image if available
      if (sandwich.imageUrl) {
        setPreviewUrl(sandwich.imageUrl);
      } else {
        setPreviewUrl("");
      }

      // Reset file selection when sandwich changes
      setSelectedFile(null);
    }
  }, [sandwich]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !sandwich ||
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

      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadMenuImage(selectedFile, "sandwiches");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // Continue without new image if upload fails
          console.warn("Image upload failed, keeping existing image");
          toast.warning(
            "Image upload failed, but sandwich will be updated with existing data"
          );
        }
      }

      // Update sandwich data
      const sandwichData: EditSandwichFormData = {
        ...formData,
        imageUrl,
        image: selectedFile || undefined,
      };

      await updateSandwichMutation.mutateAsync({
        id: sandwich.id,
        data: sandwichData,
      });

      toast.success("Sandwich updated successfully!");
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update sandwich");
      console.error("Error updating sandwich:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof EditSandwichFormData,
    value: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModifiersChange = (modifiers: Modifier[]) => {
    setFormData((prev) => ({
      ...prev,
      modifiers,
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

  const clearExistingImage = () => {
    setPreviewUrl("");
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));

    // Reset file input
    const fileInput = document.getElementById(
      "editImageFile"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  if (!sandwich) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sandwich</DialogTitle>
          <DialogDescription>
            Update the details for &quot;{sandwich.nameEn}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Sandwich Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Sandwich Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sandwich type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beef Sandwich with Cheese">
                    Beef Sandwich with Cheese
                  </SelectItem>
                  <SelectItem value="Chicken Sandwich with Cheese">
                    Chicken Sandwich with Cheese
                  </SelectItem>
                  <SelectItem value="Muhammara Sandwich with Cheese">
                    Muhammara Sandwich with Cheese
                  </SelectItem>
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
                placeholder="e.g., Classic Beef Sandwich"
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange("nameAr", e.target.value)}
                placeholder="e.g., ساندويتش لحم بقري كلاسيكي"
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
              <Label htmlFor="editImageFile">Sandwich Image (Optional)</Label>
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
                      src={getReliableImageUrl(previewUrl, "sandwich")}
                      alt="Sandwich preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {/* Clear image completely */}
                      <button
                        type="button"
                        onClick={clearExistingImage}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Indicator for new vs existing image */}
                    {selectedFile && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    )}
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
              disabled={updateSandwichMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : updateSandwichMutation.isPending
                ? "Updating..."
                : "Update Sandwich"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

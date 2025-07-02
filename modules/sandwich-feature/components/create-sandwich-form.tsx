"use client";

import { useState } from "react";
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
import { useCreateSandwich } from "../hooks/use-sandwiches";
import { uploadMenuImage } from "@/lib/image-upload";
import type { CreateSandwichFormData } from "@/lib/schemas";

interface CreateSandwichFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSandwichForm({
  open,
  onOpenChange,
}: CreateSandwichFormProps) {
  const [formData, setFormData] = useState<CreateSandwichFormData>({
    type: "Beef Sandwich with Cheese",
    nameAr: "",
    nameEn: "",
    size: "medium",
    priceWithVat: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const createSandwichMutation = useCreateSandwich();

  const resetForm = () => {
    setFormData({
      type: "Beef Sandwich with Cheese",
      nameAr: "",
      nameEn: "",
      size: "medium",
      priceWithVat: "",
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn || !formData.nameAr || !formData.priceWithVat) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    // Show loading toast with spinner
    const toastId = toast.loading("Creating sandwich...", {
      description: selectedFile
        ? "Uploading image and saving sandwich..."
        : "Saving sandwich data...",
    });

    try {
      // Upload image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadMenuImage(selectedFile, "sandwiches");
        if (!uploadedUrl) {
          // Continue without image if upload fails
          console.warn("Image upload failed, continuing without image");
          toast.warning(
            "Image upload failed, but sandwich will be created without image",
            {
              id: toastId,
            }
          );
        }
      }

      // Create sandwich data
      const sandwichData: CreateSandwichFormData = {
        ...formData,
        image: selectedFile || undefined,
      };

      await createSandwichMutation.mutateAsync(sandwichData);

      toast.success("Sandwich created successfully!", {
        id: toastId,
        description: "Your new sandwich has been added to the menu",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create sandwich", {
        id: toastId,
        description: "Please try again or contact support",
      });
      console.error("Error creating sandwich:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSandwichFormData,
    value: string | undefined
  ) => {
    setFormData((prev) => ({
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
    const fileInput = document.getElementById("imageFile") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Sandwich</DialogTitle>
          <DialogDescription>
            Add a new sandwich to your menu. Fill in all the details below.
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
              <Label htmlFor="imageFile">Sandwich Image (Optional)</Label>
              <div className="space-y-3">
                <Input
                  id="imageFile"
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
              disabled={createSandwichMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : createSandwichMutation.isPending
                ? "Creating..."
                : "Create Sandwich"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

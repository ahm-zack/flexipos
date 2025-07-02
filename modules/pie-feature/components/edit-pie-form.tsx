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
import { useUpdatePie } from "../hooks/use-pies";
import { uploadMenuImage } from "@/lib/image-upload";
import type { Pie } from "@/lib/db/schema";
import type { UpdatePie } from "@/lib/schemas";

interface EditPieFormProps {
  pie: Pie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPieForm({ pie, open, onOpenChange }: EditPieFormProps) {
  const [formData, setFormData] = useState<UpdatePie>({
    type: "Akkawi Cheese",
    size: "medium",
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    priceWithVat: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const updatePieMutation = useUpdatePie();

  // Update form data when pie changes
  useEffect(() => {
    if (pie) {
      setFormData({
        type: pie.type,
        size: pie.size,
        nameAr: pie.nameAr,
        nameEn: pie.nameEn,
        imageUrl: pie.imageUrl || "",
        priceWithVat: pie.priceWithVat,
      });

      // Set preview to existing image if available
      if (pie.imageUrl) {
        setPreviewUrl(pie.imageUrl);
      } else {
        setPreviewUrl("");
      }

      // Reset file selection when pie changes
      setSelectedFile(null);
    }
  }, [pie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !pie ||
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
        const uploadedUrl = await uploadMenuImage(selectedFile, "pies");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // Continue without new image if upload fails
          console.warn("Image upload failed, keeping existing image");
          toast.warning(
            "Image upload failed, but pie will be updated with existing data"
          );
        }
      }

      // Update pie data
      const pieData: UpdatePie = {
        ...formData,
        imageUrl,
      };

      await updatePieMutation.mutateAsync({
        id: pie.id,
        data: pieData,
      });

      toast.success("Pie updated successfully!");
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update pie");
      console.error("Error updating pie:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdatePie,
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

  if (!pie) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pie</DialogTitle>
          <DialogDescription>
            Update the details for &quot;{pie.nameEn}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pie Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Pie Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pie type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Akkawi Cheese">Akkawi Cheese</SelectItem>
                  <SelectItem value="Halloumi Cheese">
                    Halloumi Cheese
                  </SelectItem>
                  <SelectItem value="Cream Cheese">Cream Cheese</SelectItem>
                  <SelectItem value="Zaatar">Zaatar</SelectItem>
                  <SelectItem value="Labneh & Vegetables">
                    Labneh & Vegetables
                  </SelectItem>
                  <SelectItem value="Muhammara + Akkawi Cheese + Zaatar">
                    Muhammara + Akkawi Cheese + Zaatar
                  </SelectItem>
                  <SelectItem value="Akkawi Cheese + Zaatar">
                    Akkawi Cheese + Zaatar
                  </SelectItem>
                  <SelectItem value="Labneh + Zaatar">
                    Labneh + Zaatar
                  </SelectItem>
                  <SelectItem value="Halloumi Cheese + Zaatar">
                    Halloumi Cheese + Zaatar
                  </SelectItem>
                  <SelectItem value="Sweet Cheese + Akkawi + Mozzarella">
                    Sweet Cheese + Akkawi + Mozzarella
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
                placeholder="e.g., Classic Apple Pie"
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange("nameAr", e.target.value)}
                placeholder="e.g., فطيرة التفاح الكلاسيكية"
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
              <Label htmlFor="editImageFile">Pie Image (Optional)</Label>
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
                      src={getReliableImageUrl(previewUrl, "pie")}
                      alt="Pie preview"
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
              disabled={updatePieMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : updatePieMutation.isPending
                ? "Updating..."
                : "Update Pie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

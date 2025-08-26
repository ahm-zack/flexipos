"use client";

import { useState, useCallback } from "react";
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
import { useCreatePie } from "../hooks/use-pies";
import { uploadMenuImage } from "@/lib/image-upload";
import type { CreatePie, Modifier, PieType } from "@/lib/schemas";
import { ModifierManager } from "@/components/modifier-manager";

interface CreatePieFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePieForm({ open, onOpenChange }: CreatePieFormProps) {
  const [formData, setFormData] = useState<CreatePie>({
    type: "Akkawi Cheese",
    nameAr: "",
    nameEn: "",
    size: "medium",
    imageUrl: "",
    priceWithVat: "",
    modifiers: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const createPieMutation = useCreatePie();

  const resetForm = () => {
    setFormData({
      type: "Akkawi Cheese",
      nameAr: "",
      nameEn: "",
      size: "medium",
      imageUrl: "",
      priceWithVat: "",
      modifiers: [],
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
    const toastId = toast.loading("Creating pie...", {
      description: selectedFile
        ? "Uploading image and saving pie..."
        : "Saving pie data...",
    });

    try {
      let imageUrl = "";

      // Upload image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadMenuImage(selectedFile, "pies");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // Continue without image if upload fails
          console.warn("Image upload failed, continuing without image");
          toast.warning(
            "Image upload failed, but pie will be created without image",
            {
              id: toastId,
            }
          );
        }
      }

      // Auto-generate type from English name or use default
      const generatePieType = (nameEn: string): PieType => {
        const name = nameEn.toLowerCase();

        // Try to match with existing pie types
        if (name.includes("akkawi") && name.includes("zaatar")) {
          return "Akkawi Cheese + Zaatar";
        } else if (name.includes("halloumi") && name.includes("zaatar")) {
          return "Halloumi Cheese + Zaatar";
        } else if (name.includes("labneh") && name.includes("zaatar")) {
          return "Labneh + Zaatar";
        } else if (name.includes("muhammara") && name.includes("akkawi")) {
          return "Muhammara + Akkawi Cheese + Zaatar";
        } else if (
          name.includes("sweet cheese") ||
          name.includes("mozzarella")
        ) {
          return "Sweet Cheese + Akkawi + Mozzarella";
        } else if (name.includes("akkawi")) {
          return "Akkawi Cheese";
        } else if (name.includes("halloumi")) {
          return "Halloumi Cheese";
        } else if (name.includes("cream cheese")) {
          return "Cream Cheese";
        } else if (name.includes("zaatar")) {
          return "Zaatar";
        } else if (name.includes("labneh")) {
          return "Labneh & Vegetables";
        } else {
          // Default fallback
          return "Akkawi Cheese";
        }
      };

      // Create pie data with auto-generated type
      const pieData: CreatePie = {
        ...formData,
        type: generatePieType(formData.nameEn),
        imageUrl,
      };

      await createPieMutation.mutateAsync(pieData);

      toast.success("Pie created successfully!", {
        id: toastId,
        description: "Your new pie has been added to the menu",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create pie", {
        id: toastId,
        description: "Please try again or contact support",
      });
      console.error("Error creating pie:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreatePie,
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

  const handleModifiersChange = useCallback((modifiers: Modifier[]) => {
    queueMicrotask(() => setFormData((f) => ({ ...f, modifiers })));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Pie</DialogTitle>
          <DialogDescription>
            Add a new pie to your menu. Fill in all the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pie Type - HIDDEN as per customer request */}
            {/* <div className="space-y-2">
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
            </div> */}

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
              <Label htmlFor="imageFile">Pie Image (Optional)</Label>
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
                      src={getReliableImageUrl(previewUrl, "pie")}
                      alt="Pie preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
                Base price for this pie. Modifier prices will be added
                separately when customers select them.
              </p>
            </div>

            {/* Modifiers Field */}
            <div className="space-y-2">
              <ModifierManager
                modifiers={formData.modifiers}
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
              disabled={createPieMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : createPieMutation.isPending
                ? "Creating..."
                : "Create Pie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

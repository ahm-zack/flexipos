"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getReliableImageUrl } from "@/lib/image-utils";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
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
import { useUpdatePizza } from "../hooks/use-pizzas";
import { uploadMenuImage } from "@/lib/image-upload";
import { ModifierManager } from "@/components/modifier-manager";
import type { Pizza } from "@/lib/db/schema";
import type { UpdatePizza, Modifier, PizzaType } from "@/lib/schemas";

interface EditPizzaFormProps {
  pizza: Pizza | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPizzaForm({
  pizza,
  open,
  onOpenChange,
}: EditPizzaFormProps) {
  const [formData, setFormData] = useState<UpdatePizza>({
    type: "Margherita",
    nameAr: "",
    nameEn: "",
    crust: "original",
    imageUrl: "",
    extras: undefined,
    priceWithVat: "",
    modifiers: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const updatePizzaMutation = useUpdatePizza();

  // Update form data when pizza changes
  useEffect(() => {
    if (pizza) {
      setFormData({
        type: pizza.type,
        nameAr: pizza.nameAr,
        nameEn: pizza.nameEn,
        crust: pizza.crust || "original",
        imageUrl: pizza.imageUrl || "",
        extras: pizza.extras || undefined,
        priceWithVat: pizza.priceWithVat,
        modifiers: pizza.modifiers || [],
      });

      // Set preview to existing image if available
      if (pizza.imageUrl) {
        setPreviewUrl(pizza.imageUrl);
      } else {
        setPreviewUrl("");
      }

      // Reset file selection when pizza changes
      setSelectedFile(null);
    }
  }, [pizza]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !pizza ||
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
        const uploadedUrl = await uploadMenuImage(selectedFile, "pizzas");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // Continue without new image if upload fails
          console.warn("Image upload failed, keeping existing image");
          toast.warning(
            "Image upload failed, but pizza will be updated with existing data"
          );
        }
      }

      // Auto-generate type from English name or use default
      const generatePizzaType = (nameEn: string): PizzaType => {
        const name = nameEn.toLowerCase();

        // Try to match with existing pizza types
        if (name.includes("margherita")) {
          return "Margherita";
        } else if (name.includes("vegetable") || name.includes("veggie")) {
          return "Vegetable";
        } else if (name.includes("pepperoni")) {
          return "Pepperoni";
        } else if (name.includes("mortadella")) {
          return "Mortadella";
        } else if (name.includes("chicken")) {
          return "Chicken";
        } else {
          // Default fallback
          return "Margherita";
        }
      };

      // Update pizza data with auto-generated type
      const pizzaData: UpdatePizza = {
        ...formData,
        type: generatePizzaType(formData.nameEn || pizza?.nameEn || ""),
        imageUrl,
      };

      await updatePizzaMutation.mutateAsync({
        id: pizza.id,
        data: pizzaData,
      });

      toast.success("Pizza updated successfully!");
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update pizza");
      console.error("Error updating pizza:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdatePizza,
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
      "editPizzaImageFile"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleModifiersChange = useCallback((modifiers: Modifier[]) => {
    queueMicrotask(() => setFormData((f) => ({ ...f, modifiers })));
  }, []);

  if (!pizza) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pizza</DialogTitle>
          <DialogDescription>
            Update the details for &quot;{pizza.nameEn}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pizza Type - HIDDEN as per customer request */}
            {/* <div className="space-y-2">
              <Label htmlFor="type">Pizza Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pizza type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Margherita">Margherita</SelectItem>
                  <SelectItem value="Pepperoni">Pepperoni</SelectItem>
                  <SelectItem value="Vegetable">Vegetable</SelectItem>
                  <SelectItem value="Mortadella">Mortadella</SelectItem>
                  <SelectItem value="Chicken">Chicken</SelectItem>
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
                placeholder="e.g., Margherita Pizza"
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => handleInputChange("nameAr", e.target.value)}
                placeholder="e.g., بيتزا مارغريتا"
                dir="rtl"
              />
            </div>

            {/* Crust */}
            {/* <div className="space-y-2">
              <Label htmlFor="crust">Crust Type *</Label>
              <Select
                value={formData.crust}
                onValueChange={(value) => handleInputChange("crust", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crust type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="thin">Thin</SelectItem>
                  <SelectItem value="thick">Thick</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="editPizzaImageFile">Pizza Image (Optional)</Label>
              <div className="space-y-3">
                <Input
                  id="editPizzaImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />

                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={getReliableImageUrl(previewUrl, "pizza")}
                      alt="Pizza preview"
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
              disabled={updatePizzaMutation.isPending || isUploading}
            >
              {isUploading
                ? "Uploading..."
                : updatePizzaMutation.isPending
                ? "Updating..."
                : "Update Pizza"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

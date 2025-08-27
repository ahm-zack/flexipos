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
// 🔄 NEW: Import from client-side hooks
import { useCreatePizza } from "../hooks/use-pizzas";
import { uploadMenuImage } from "@/lib/image-upload";
import type { CreatePizza, Modifier, PizzaType } from "@/lib/schemas";
import { ModifierManager } from "@/components/modifier-manager";

interface CreatePizzaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePizzaForm({ open, onOpenChange }: CreatePizzaFormProps) {
  const [formData, setFormData] = useState<CreatePizza>({
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

  // 🔄 SAME: Hook usage remains exactly the same
  const createPizzaMutation = useCreatePizza();

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
          const uploadedUrl = await uploadMenuImage(selectedFile, "pizzas");
          imageUrl = uploadedUrl || "";
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
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

      // 🔄 SAME: Mutation call with auto-generated type
      await createPizzaMutation.mutateAsync({
        ...formData,
        type: generatePizzaType(formData.nameEn),
        imageUrl,
        priceWithVat: formData.priceWithVat,
      });

      // 🆕 NEW: Better user feedback with real-time updates
      toast.success("Pizza created successfully! 🍕", {
        description: "The pizza will appear in the list automatically",
      });

      // Reset form
      setFormData({
        type: "Margherita",
        nameAr: "",
        nameEn: "",
        crust: "original",
        imageUrl: "",
        extras: undefined,
        priceWithVat: "",
        modifiers: [],
      });
      setSelectedFile(null);
      setPreviewUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating pizza:", error);
      toast.error("Failed to create pizza");
    }
  };

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
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
    },
    []
  );

  const removeImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));

    // Reset file input
    const fileInput = document.getElementById(
      "createPizzaImageFile"
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
          <DialogTitle>Create New Pizza</DialogTitle>
          <DialogDescription>
            Add a new pizza to your menu. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pizza Type - HIDDEN as per customer request */}
            {/* <div className="space-y-2">
              <Label htmlFor="type">Pizza Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as CreatePizza["type"],
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                }
                placeholder="e.g., Margherita Pizza"
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
                placeholder="e.g., بيتزا مارغريتا"
                dir="rtl"
                required
              />
            </div>

            {/* Crust Type */}
            <div className="space-y-2">
              <Label htmlFor="crust">Crust Type *</Label>
              <Select
                value={formData.crust || "original"}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    crust: value as CreatePizza["crust"],
                  }))
                }
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
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="createPizzaImageFile">
                Pizza Image (Optional)
              </Label>
              <div className="space-y-3">
                <Input
                  id="createPizzaImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />

                {/* Image Preview */}
                {(previewUrl || formData.imageUrl) && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={
                        previewUrl ||
                        getReliableImageUrl(formData.imageUrl, "pizzas")
                      }
                      alt="Pizza preview"
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

                    {/* Indicator for new image */}
                    {selectedFile && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Instructions */}
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
              disabled={createPizzaMutation.isPending || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : createPizzaMutation.isPending ? (
                "Creating..."
              ) : (
                "Create Pizza"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 🆕 NEW: Example of optimistic updates version
export function CreatePizzaFormWithOptimisticUpdates({
  open,
  onOpenChange,
}: CreatePizzaFormProps) {
  // 🆕 Use optimistic updates for instant feedback
  const createPizzaMutation = useCreatePizza();

  const [formData, setFormData] = useState<CreatePizza>({
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
          const uploadedUrl = await uploadMenuImage(selectedFile, "pizzas");
          imageUrl = uploadedUrl || "";
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Create pizza using regular mutation - real-time updates will handle the cache
      await createPizzaMutation.mutateAsync({
        ...formData,
        imageUrl,
        priceWithVat: formData.priceWithVat,
      });

      // Success feedback
      toast.success("Pizza created! 🍕");

      // Reset form
      setFormData({
        type: "Margherita",
        nameAr: "",
        nameEn: "",
        crust: "original",
        imageUrl: "",
        extras: undefined,
        priceWithVat: "",
        modifiers: [],
      });
      setSelectedFile(null);
      setPreviewUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating pizza:", error);
      toast.error("Failed to create pizza");
    }
  };

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
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
    },
    []
  );

  const removeImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));

    // Reset file input
    const fileInput = document.getElementById(
      "createPizzaOptimisticImageFile"
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
          <DialogTitle>Create New Pizza</DialogTitle>
          <DialogDescription>
            Add a new pizza with instant feedback. Changes appear immediately!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pizza Type */}
            {/* <div className="space-y-2">
              <Label htmlFor="type">Pizza Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as CreatePizza["type"],
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                }
                placeholder="e.g., Margherita Pizza"
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
                placeholder="e.g., بيتزا مارغريتا"
                dir="rtl"
                required
              />
            </div>

            {/* Crust Type */}
            {/* <div className="space-y-2">
              <Label htmlFor="crust">Crust Type *</Label>
              <Select
                value={formData.crust || "original"}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    crust: value as CreatePizza["crust"],
                  }))
                }
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
              <Label htmlFor="createPizzaOptimisticImageFile">
                Pizza Image (Optional)
              </Label>
              <div className="space-y-3">
                <Input
                  id="createPizzaOptimisticImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />

                {/* Image Preview */}
                {(previewUrl || formData.imageUrl) && (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={
                        previewUrl ||
                        getReliableImageUrl(formData.imageUrl, "pizzas")
                      }
                      alt="Pizza preview"
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

                    {/* Indicator for new image */}
                    {selectedFile && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Instructions */}
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
              disabled={createPizzaMutation.isPending || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : createPizzaMutation.isPending ? (
                "Creating..."
              ) : (
                "Create Pizza"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

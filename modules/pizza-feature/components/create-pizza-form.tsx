"use client";

import { useState } from "react";
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
import { useCreatePizza } from "../hooks/use-pizzas";
import type { CreatePizza } from "@/lib/schemas";

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
  });

  const createPizzaMutation = useCreatePizza();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn || !formData.nameAr || !formData.priceWithVat) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createPizzaMutation.mutateAsync(formData);
      toast.success("Pizza created successfully!");
      onOpenChange(false);

      // Reset form
      setFormData({
        type: "Margherita",
        nameAr: "",
        nameEn: "",
        crust: "original",
        imageUrl: "",
        extras: undefined,
        priceWithVat: "",
      });
    } catch (error) {
      toast.error("Failed to create pizza");
      console.error("Error creating pizza:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreatePizza,
    value: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Pizza</DialogTitle>
          <DialogDescription>
            Add a new pizza to your menu. Fill in all the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pizza Type */}
            <div className="space-y-2">
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
            </div>

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

            {/* Crust Type */}
            <div className="space-y-2">
              <Label htmlFor="crust">Crust Type</Label>
              <Select
                value={formData.crust || "original"}
                onValueChange={(value) => handleInputChange("crust", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crust type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="thin">Thin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Extras */}
            <div className="space-y-2">
              <Label htmlFor="extras">Extras (Optional)</Label>
              <Select
                value={formData.extras || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "extras",
                    value === "none" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select extras (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No extras</SelectItem>
                  <SelectItem value="cheese">Cheese</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="Pepperoni">Pepperoni</SelectItem>
                  <SelectItem value="Mortadella">Mortadella</SelectItem>
                  <SelectItem value="Chicken">Chicken</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                placeholder="https://example.supabase.co/storage/v1/object/public/pizza-images/pizza.jpg"
              />
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
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPizzaMutation.isPending}>
              {createPizzaMutation.isPending ? "Creating..." : "Create Pizza"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

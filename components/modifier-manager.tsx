"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";
import { useModifiers } from "@/hooks/use-modifiers";
import type {
  ApiModifier,
  CreateModifierRequest,
} from "@/lib/modifiers-service";

interface ModifierManagerProps {
  itemType: "pizza" | "pie" | "sandwich" | "mini_pie";
  itemId?: string;
  onModifiersChange?: (modifiers: ApiModifier[]) => void;
}

interface NewModifier {
  name: string;
  type: "extra" | "without";
  price: string;
}

export function ModifierManager({
  itemType,
  itemId,
  onModifiersChange,
}: ModifierManagerProps) {
  const [modifiers, setModifiers] = useState<ApiModifier[]>([]);
  const [newModifier, setNewModifier] = useState<NewModifier>({
    name: "",
    type: "extra",
    price: "",
  });
  const [isAddingModifier, setIsAddingModifier] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const {
    modifiers: existingModifiers,
    createModifier,
    deleteModifier,
    reorderModifiers,
    isLoading,
  } = useModifiers({
    menuItemId: itemId,
    menuItemType: itemType,
    autoFetch: !!itemId,
  });

  // Load existing modifiers when component mounts or itemId changes
  useEffect(() => {
    if (existingModifiers) {
      setModifiers(existingModifiers);
    }
  }, [existingModifiers]);

  // Notify parent component when modifiers change
  useEffect(() => {
    if (onModifiersChange) {
      onModifiersChange(modifiers);
    }
  }, [modifiers, onModifiersChange]);

  const handleAddModifier = async () => {
    if (!newModifier.name.trim()) {
      toast.error("Please enter a modifier name");
      return;
    }

    if (newModifier.type === "extra" && !newModifier.price.trim()) {
      toast.error("Please enter a price for extras");
      return;
    }

    try {
      const modifierData: CreateModifierRequest = {
        menuItemId: itemId || "",
        menuItemType: itemType,
        name: newModifier.name.trim(),
        type: newModifier.type,
        price: newModifier.type === "extra" ? parseFloat(newModifier.price) : 0,
        displayOrder: modifiers.length,
      };

      if (itemId) {
        // Item exists, create modifier via API
        await createModifier(modifierData);
      } else {
        // Item doesn't exist yet, add to local state
        const tempModifier: ApiModifier = {
          id: `temp-${Date.now()}`,
          menuItemId: itemId || "",
          menuItemType: itemType,
          name: modifierData.name,
          type: modifierData.type,
          price: modifierData.price,
          displayOrder: modifierData.displayOrder || 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setModifiers((prev) => [...prev, tempModifier]);
      }

      // Reset form
      setNewModifier({
        name: "",
        type: "extra",
        price: "",
      });
      setIsAddingModifier(false);

      toast.success("Modifier added successfully");
    } catch (error) {
      toast.error("Failed to add modifier");
      console.error("Error adding modifier:", error);
    }
  };

  const handleDeleteModifier = async (modifierId: string) => {
    try {
      if (modifierId.startsWith("temp-")) {
        // Remove from local state
        setModifiers((prev) => prev.filter((m) => m.id !== modifierId));
      } else {
        // Delete via API
        await deleteModifier(modifierId);
      }
      toast.success("Modifier deleted successfully");
    } catch (error) {
      toast.error("Failed to delete modifier");
      console.error("Error deleting modifier:", error);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newModifiers = [...modifiers];
    const draggedItem = newModifiers[draggedIndex];

    // Remove dragged item
    newModifiers.splice(draggedIndex, 1);

    // Insert at new position
    newModifiers.splice(dropIndex, 0, draggedItem);

    // Update display order
    const reorderedModifiers = newModifiers.map((modifier, index) => ({
      ...modifier,
      displayOrder: index,
    }));

    setModifiers(reorderedModifiers);
    setDraggedIndex(null);

    // Update order in backend if item exists
    if (itemId && !reorderedModifiers.some((m) => m.id.startsWith("temp-"))) {
      try {
        await reorderModifiers(
          reorderedModifiers.map((m, index) => ({
            id: m.id,
            displayOrder: index,
          }))
        );
        toast.success("Modifier order updated");
      } catch (error) {
        toast.error("Failed to update modifier order");
        console.error("Error reordering modifiers:", error);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Modifiers</span>
          <Badge variant="secondary" className="text-xs">
            {modifiers.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add extras (with price) and withouts (no price) for this item. Extras
          will be added to the order total when selected by customers.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Modifiers */}
        {modifiers.length > 0 && (
          <div className="space-y-2">
            <Label>Current Modifiers</Label>
            <div className="space-y-1">
              {modifiers.map((modifier, index) => (
                <div
                  key={modifier.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center gap-2 p-2 border rounded-md bg-background cursor-move hover:bg-accent transition-colors ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">{modifier.name}</span>
                    <Badge
                      variant={
                        modifier.type === "extra" ? "default" : "secondary"
                      }
                    >
                      {modifier.type}
                    </Badge>
                    {modifier.type === "extra" && (
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(modifier.price)}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModifier(modifier.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Modifier */}
        <Separator />

        {!isAddingModifier ? (
          <Button
            variant="outline"
            onClick={() => setIsAddingModifier(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Modifier
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-md bg-accent/5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Add New Modifier</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingModifier(false);
                  setNewModifier({ name: "", type: "extra", price: "" });
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="modifier-name" className="text-xs">
                  Name *
                </Label>
                <Input
                  id="modifier-name"
                  value={newModifier.name}
                  onChange={(e) =>
                    setNewModifier((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Extra Cheese, No Onions"
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="modifier-type" className="text-xs">
                  Type *
                </Label>
                <Select
                  value={newModifier.type}
                  onValueChange={(value: "extra" | "without") =>
                    setNewModifier((prev) => ({
                      ...prev,
                      type: value,
                      price: value === "without" ? "" : prev.price,
                    }))
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extra">Extra (with price)</SelectItem>
                    <SelectItem value="without">Without (no price)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newModifier.type === "extra" && (
                <div className="space-y-1">
                  <Label htmlFor="modifier-price" className="text-xs">
                    Price (SAR) *
                  </Label>
                  <Input
                    id="modifier-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newModifier.price}
                    onChange={(e) =>
                      setNewModifier((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="h-8"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddModifier}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                {isLoading ? "Adding..." : "Add Modifier"}
              </Button>
            </div>
          </div>
        )}

        {modifiers.length === 0 && !isAddingModifier && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No modifiers added yet</p>
            <p className="text-xs">
              Click &quot;Add Modifier&quot; to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

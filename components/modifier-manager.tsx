"use client";

import { useState, useEffect, useRef } from "react";
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
import type { Modifier } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";

interface ModifierManagerProps {
  modifiers: Modifier[];
  onModifiersChange: (modifiers: Modifier[]) => void;
}

interface NewModifier {
  name: string;
  type: "extra" | "without";
  price: string;
}

export function ModifierManager({
  modifiers,
  onModifiersChange,
}: ModifierManagerProps) {
  const isInitialMount = useRef(true);
  const [localModifiers, setLocalModifiers] = useState<Modifier[]>(modifiers);
  const [newModifier, setNewModifier] = useState<NewModifier>({
    name: "",
    type: "extra",
    price: "",
  });
  const [isAddingModifier, setIsAddingModifier] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalModifiers(modifiers);
    isInitialMount.current = false;
    // Do NOT call onModifiersChange here!
  }, [modifiers]);

  // No useEffect for onModifiersChange!

  const handleAddModifier = () => {
    if (!newModifier.name.trim()) {
      toast.error("Please enter a modifier name");
      return;
    }
    if (newModifier.type === "extra" && !newModifier.price.trim()) {
      toast.error("Please enter a price for extras");
      return;
    }
    const tempModifier: Modifier = {
      id: uuidv4(),
      name: newModifier.name.trim(),
      type: newModifier.type,
      price: newModifier.type === "extra" ? parseFloat(newModifier.price) : 0,
    };
    const updated = [...localModifiers, tempModifier];
    setLocalModifiers(updated);
    onModifiersChange(updated);
    setNewModifier({ name: "", type: "extra", price: "" });
    setIsAddingModifier(false);
    toast.success("Modifier added successfully");
  };

  const handleDeleteModifier = (modifierId: string) => {
    const updated = localModifiers.filter((m) => m.id !== modifierId);
    setLocalModifiers(updated);
    onModifiersChange(updated);
    toast.success("Modifier deleted successfully");
  };

  // Drag-and-drop reorder
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const updated = [...localModifiers];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, removed);
      setLocalModifiers(updated);
      onModifiersChange(updated);
      setDraggedIndex(null);
      return;
    }
    setDraggedIndex(null);
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
            {localModifiers.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add extras (with price) and withouts (no price) for this item. Extras
          will be added to the order total when selected by customers.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Modifiers */}
        {localModifiers.length > 0 && (
          <div className="space-y-2">
            <Label>Current Modifiers</Label>
            <div className="space-y-1">
              {localModifiers.map((modifier, index) => (
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
                    min={0}
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
              <Button onClick={handleAddModifier} size="sm" className="flex-1">
                Add Modifier
              </Button>
            </div>
          </div>
        )}

        {localModifiers.length === 0 && !isAddingModifier && (
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

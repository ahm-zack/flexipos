"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { PriceDisplay } from "@/components/currency";
import { toast } from "sonner";
import type { Modifier } from "@/lib/schemas";
import type {
  CartItem,
  CartItemModifier,
} from "@/modules/cart/types/cart.types";

interface ModifierSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    itemType: "pizza" | "pie" | "sandwich" | "mini_pie";
    modifiers: Modifier[];
  };
}

export function ModifierSelectionDialog({
  open,
  onOpenChange,
  item,
}: ModifierSelectionDialogProps) {
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedModifiers([]);
      setQuantity(1);
    }
  }, [open]);

  const handleModifierToggle = (modifier: Modifier, checked: boolean) => {
    if (checked) {
      setSelectedModifiers((prev) => [...prev, modifier]);
    } else {
      setSelectedModifiers((prev) => prev.filter((m) => m.id !== modifier.id));
    }
  };

  const calculateModifiersTotal = () => {
    return selectedModifiers.reduce((total, modifier) => {
      return total + (modifier.type === "extra" ? modifier.price : 0);
    }, 0);
  };

  const handleAddToCart = () => {
    const modifiersTotal = calculateModifiersTotal();
    const cartModifiers: CartItemModifier[] = selectedModifiers.map(
      (modifier) => ({
        id: modifier.id,
        name: modifier.name,
        type: modifier.type,
        price: modifier.price,
      })
    );

    const cartItem: Omit<CartItem, "quantity"> = {
      id: `${item.id}-${Date.now()}`, // Unique ID for each cart item with modifiers
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      image: item.image,
      modifiers: cartModifiers,
      modifiersTotal,
    };

    // Add the item with specified quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        ...cartItem,
        // Keep the original UUID for the item, but let the cart handle uniqueness internally
      });
    }

    toast.success(
      `${quantity}x ${item.name} added to cart${
        selectedModifiers.length > 0 ? " with modifiers" : ""
      }!`
    );
    onOpenChange(false);
  };

  const itemTotal = item.price + calculateModifiersTotal();
  const grandTotal = itemTotal * quantity;

  const modifiers = item.modifiers || [];
  const extrasModifiers = modifiers.filter((m) => m.type === "extra");
  const withoutsModifiers = modifiers.filter((m) => m.type === "without");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Customize Your Order
          </DialogTitle>
          <DialogDescription>
            Customize your {item.name} with extras and options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    <PriceDisplay price={item.price} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Base Price
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Extras */}
          {extrasModifiers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Extras
                  <Badge variant="default" className="text-xs">
                    +Price
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {extrasModifiers.map((modifier) => (
                  <div
                    key={modifier.id}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={modifier.id}
                      checked={selectedModifiers.some(
                        (m) => m.id === modifier.id
                      )}
                      onCheckedChange={(checked: boolean) =>
                        handleModifierToggle(modifier, checked)
                      }
                    />
                    <label
                      htmlFor={modifier.id}
                      className="flex-1 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-medium">{modifier.name}</span>
                      <span className="text-sm font-semibold text-green-600">
                        +<PriceDisplay price={modifier.price} />
                      </span>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Withouts */}
          {withoutsModifiers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Without
                  <Badge variant="secondary" className="text-xs">
                    No Price
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {withoutsModifiers.map((modifier) => (
                  <div
                    key={modifier.id}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={modifier.id}
                      checked={selectedModifiers.some(
                        (m) => m.id === modifier.id
                      )}
                      onCheckedChange={(checked: boolean) =>
                        handleModifierToggle(modifier, checked)
                      }
                    />
                    <label
                      htmlFor={modifier.id}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {modifier.name}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No Modifiers Available */}
          {modifiers.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No customization options available for this item.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price ({quantity}x)</span>
                  <span>
                    <PriceDisplay price={item.price * quantity} />
                  </span>
                </div>

                {selectedModifiers.filter((m) => m.type === "extra").length >
                  0 && (
                  <div className="flex justify-between text-sm">
                    <span>Extras ({quantity}x)</span>
                    <span className="text-green-600">
                      +
                      <PriceDisplay
                        price={calculateModifiersTotal() * quantity}
                      />
                    </span>
                  </div>
                )}

                {selectedModifiers.filter((m) => m.type === "without").length >
                  0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="text-xs">
                      Without:{" "}
                      {selectedModifiers
                        .filter((m) => m.type === "without")
                        .map((m) => m.name)
                        .join(", ")}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    <PriceDisplay price={grandTotal} />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToCart} className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart - <PriceDisplay price={grandTotal} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

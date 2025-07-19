"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Minus, ShoppingCart, Sparkles } from "lucide-react";
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
    itemType:
      | "pizza"
      | "pie"
      | "sandwich"
      | "mini_pie"
      | "appetizer"
      | "baverages"
      | "shawerma"
      | "burger"
      | "side-order";
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
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedModifiers([]);
      setQuantity(1);
      setIsAdding(false);
    }
  }, [open]);

  const handleModifierToggle = (modifier: Modifier) => {
    const isSelected = selectedModifiers.some((m) => m.id === modifier.id);
    if (isSelected) {
      setSelectedModifiers((prev) => prev.filter((m) => m.id !== modifier.id));
    } else {
      setSelectedModifiers((prev) => [...prev, modifier]);
    }
  };

  const calculateModifiersTotal = () => {
    return selectedModifiers.reduce((total, modifier) => {
      return total + (modifier.type === "extra" ? modifier.price : 0);
    }, 0);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

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
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      image: item.image,
      modifiers: cartModifiers,
      modifiersTotal,
    };

    for (let i = 0; i < quantity; i++) {
      addItem({
        ...cartItem,
      });
    }

    toast.success(
      `${quantity}x ${item.name} added to cart${
        selectedModifiers.length > 0 ? " with modifiers" : ""
      }!`
    );

    setIsAdding(false);
    onOpenChange(false);
  };

  const itemTotal = item.price + calculateModifiersTotal();
  const grandTotal = itemTotal * quantity;

  const modifiers = item.modifiers || [];
  const extrasModifiers = modifiers.filter((m) => m.type === "extra");
  const withoutsModifiers = modifiers.filter((m) => m.type === "without");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-scroll p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Customize Your Order
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Personalize your {item.name} with extras and options
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Item Info with Quantity */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    <PriceDisplay price={item.price} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modifiers */}
          {(extrasModifiers.length > 0 || withoutsModifiers.length > 0) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Customization Options</h3>

                <div className="space-y-3">
                  {/* Extras */}
                  {extrasModifiers.map((modifier) => {
                    const isSelected = selectedModifiers.some(
                      (m) => m.id === modifier.id
                    );
                    return (
                      <div
                        key={modifier.id}
                        onClick={() => handleModifierToggle(modifier)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border/50 hover:border-border hover:bg-muted/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                            ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-border/50"
                            }
                          `}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-medium">{modifier.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            <PriceDisplay price={modifier.price} />
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {/* Separator if both types exist */}
                  {extrasModifiers.length > 0 &&
                    withoutsModifiers.length > 0 && (
                      <Separator className="my-4" />
                    )}

                  {/* Withouts */}
                  {withoutsModifiers.map((modifier) => {
                    const isSelected = selectedModifiers.some(
                      (m) => m.id === modifier.id
                    );
                    return (
                      <div
                        key={modifier.id}
                        onClick={() => handleModifierToggle(modifier)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${
                            isSelected
                              ? "border-orange-400 bg-orange-50 shadow-md"
                              : "border-border/50 hover:border-border hover:bg-muted/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                            ${
                              isSelected
                                ? "border-orange-400 bg-orange-400"
                                : "border-border/50"
                            }
                          `}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-medium">{modifier.name}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 text-xs"
                        >
                          Remove
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Modifiers */}
          {modifiers.length === 0 && (
            // <div className="text-center py-8 text-muted-foreground">
            //   <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            //   <p>No customization options available for this item.</p>
            // </div>
            <></>
          )}

          {/* Order Summary */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Item ({quantity}x)</span>
                <span>
                  <PriceDisplay price={item.price * quantity} />
                </span>
              </div>

              {calculateModifiersTotal() > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Extras ({quantity}x)</span>
                  <span className="text-green-600">
                    <PriceDisplay
                      price={calculateModifiersTotal() * quantity}
                    />
                  </span>
                </div>
              )}

              {selectedModifiers.filter((m) => m.type === "without").length >
                0 && (
                <div className="text-xs text-orange-600 mt-2">
                  Without:{" "}
                  {selectedModifiers
                    .filter((m) => m.type === "without")
                    .map((m) => m.name)
                    .join(", ")}
                </div>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  <PriceDisplay price={grandTotal} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add • <PriceDisplay price={grandTotal} />
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

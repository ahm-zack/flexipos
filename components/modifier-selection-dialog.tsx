"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { PriceDisplay } from "@/components/currency";
import { toast } from "sonner";
import { getReliableImageUrl } from "@/lib/image-utils";
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
    nameEn?: string;
    nameAr?: string;
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
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (open) {
      setSelectedModifiers([]);
      setQuantity(1);
      setIsAdding(false);
      setImageError(false);
    }
  }, [open]);

  const handleModifierToggle = (modifier: Modifier) => {
    setSelectedModifiers((prev) =>
      prev.some((m) => m.id === modifier.id)
        ? prev.filter((m) => m.id !== modifier.id)
        : [...prev, modifier],
    );
  };

  const extrasTotal = selectedModifiers.reduce(
    (sum, m) => sum + (m.type === "extra" ? m.price : 0),
    0,
  );
  const grandTotal = (item.price + extrasTotal) * quantity;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cartModifiers: CartItemModifier[] = selectedModifiers.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      price: m.price,
    }));

    const cartItem: Omit<CartItem, "quantity"> = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      image: item.image,
      modifiers: cartModifiers,
      modifiersTotal: extrasTotal,
    };

    for (let i = 0; i < quantity; i++) {
      addItem({ ...cartItem });
    }

    toast.success(
      `${quantity}× ${item.nameEn ?? item.name} added to cart${
        selectedModifiers.length > 0 ? " with modifiers" : ""
      }`,
    );

    setIsAdding(false);
    onOpenChange(false);
  };

  const modifiers = item.modifiers ?? [];
  const extras = modifiers.filter((m) => m.type === "extra");
  const withouts = modifiers.filter((m) => m.type === "without");
  const hasModifiers = modifiers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        Responsive sizing:
          mobile  → full-width bottom-sheet feel, stacked
          md/iPad → centered modal, two-column grid
          lg      → wider two-column
      */}
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl w-full max-w-[95vw] md:max-w-[720px] lg:max-w-[820px] max-h-[92vh] flex flex-col">
        <DialogTitle className="sr-only">
          {item.nameEn ?? item.name}
        </DialogTitle>

        {/* ── Main scrollable body ── */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* ── LEFT PANEL: image + basic info ── */}
          <div className="md:w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col bg-muted/30">
            {/* Image */}
            <div className="relative w-full aspect-[4/3] md:aspect-auto md:flex-1 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden min-h-[160px] md:min-h-[200px]">
              {item.image && !imageError ? (
                <Image
                  src={getReliableImageUrl(item.image, "product")}
                  alt={item.nameEn ?? item.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Item details below image */}
            <div className="p-4 space-y-2 border-t border-border/50">
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  {item.nameEn ?? item.name}
                </h2>
                {item.nameAr && (
                  <p className="text-sm text-muted-foreground" dir="rtl">
                    {item.nameAr}
                  </p>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="pt-1">
                <PriceDisplay
                  price={item.price}
                  symbolSize={14}
                  variant="primary"
                  className="text-xl font-bold text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: modifiers + qty (scrollable) ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {/* Quantity row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/40">
                <span className="font-semibold text-sm">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-full p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-xl w-8 text-center tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-9 w-9 rounded-full p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Extras */}
              {extras.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Add Extras
                    </span>
                  </div>
                  <div className="space-y-2">
                    {extras.map((mod) => {
                      const selected = selectedModifiers.some(
                        (m) => m.id === mod.id,
                      );
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleModifierToggle(mod)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left ${
                            selected
                              ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-sm"
                              : "border-border/50 hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selected
                                  ? "border-green-500 bg-green-500"
                                  : "border-border"
                              }`}
                            >
                              {selected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-sm">
                              {mod.name}
                            </span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold border-0">
                            + <PriceDisplay price={mod.price} />
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Separator */}
              {extras.length > 0 && withouts.length > 0 && <Separator />}

              {/* Withouts */}
              {withouts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      Remove Ingredients
                    </span>
                  </div>
                  <div className="space-y-2">
                    {withouts.map((mod) => {
                      const selected = selectedModifiers.some(
                        (m) => m.id === mod.id,
                      );
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleModifierToggle(mod)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left ${
                            selected
                              ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30 shadow-sm"
                              : "border-border/50 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selected
                                  ? "border-orange-400 bg-orange-400"
                                  : "border-border"
                              }`}
                            >
                              {selected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-sm">
                              {mod.name}
                            </span>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 text-xs border-0">
                            Remove
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No modifiers placeholder */}
              {!hasModifiers && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No customization options.</p>
                  <p className="text-xs mt-1 opacity-70">
                    Set the quantity and add to cart.
                  </p>
                </div>
              )}
            </div>

            {/* ── Sticky summary + action footer ── */}
            <div className="shrink-0 border-t border-border/60 bg-background px-4 md:px-6 py-4 space-y-3">
              {/* Mini price breakdown */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {item.nameEn ?? item.name} × {quantity}
                </span>
                <PriceDisplay price={item.price * quantity} />
              </div>
              {extrasTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>Extras × {quantity}</span>
                  <PriceDisplay price={extrasTotal * quantity} />
                </div>
              )}
              {selectedModifiers.some((m) => m.type === "without") && (
                <p className="text-xs text-orange-500">
                  Remove:{" "}
                  {selectedModifiers
                    .filter((m) => m.type === "without")
                    .map((m) => m.name)
                    .join(", ")}
                </p>
              )}

              <Separator />

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-none px-5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 h-11 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  {isAdding ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart · <PriceDisplay price={grandTotal} />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

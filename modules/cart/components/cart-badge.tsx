"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "../hooks/use-cart";
import { cn } from "@/lib/utils";

interface CartBadgeProps {
  className?: string;
}

export function CartBadge({ className }: CartBadgeProps) {
  const { cart, toggleCart } = useCart();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={toggleCart}
      className={cn(
        "relative h-14 w-14 rounded-full border-2 shadow-lg hover:shadow-xl transition-all duration-200",
        "bg-background/95 backdrop-blur-sm border-primary/20 hover:border-primary/40",
        "active:scale-95",
        className
      )}
    >
      <ShoppingCart className="h-6 w-6" />

      {cart.itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
        >
          {cart.itemCount > 99 ? "99+" : cart.itemCount}
        </Badge>
      )}

      <span className="sr-only">
        {cart.itemCount === 0
          ? "Shopping cart is empty"
          : `Shopping cart has ${cart.itemCount} items`}
      </span>
    </Button>
  );
}

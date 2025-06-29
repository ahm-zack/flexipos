"use client";

import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../hooks/use-cart";
import { CartItem } from "../types/cart.types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

export function AddToCartButton({
  item,
  className,
  variant = "default",
  size = "default",
  showIcon = true,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(item);
    setIsAdded(true);

    // Reset the success state after animation
    setTimeout(() => {
      setIsAdded(false);
    }, 1000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 active:scale-95",
        isAdded && "bg-green-600 hover:bg-green-700",
        className
      )}
    >
      {showIcon &&
        (isAdded ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        ))}
      {isAdded ? "Added!" : "Add to Cart"}
    </Button>
  );
}

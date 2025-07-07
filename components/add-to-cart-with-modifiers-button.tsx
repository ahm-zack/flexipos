"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface AddToCartWithModifiersButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    itemType: "pizza" | "pie" | "sandwich" | "mini_pie";
  };
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

export function AddToCartWithModifiersButton({
  item,
  className,
  variant = "default",
  size = "default",
  showIcon = true,
}: AddToCartWithModifiersButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Show success animation when dialog closes after adding to cart
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1000);
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
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
        {isAdded ? "Added!" : "Customize & Add"}
      </Button>

      <ModifierSelectionDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        item={item}
      />
    </>
  );
}

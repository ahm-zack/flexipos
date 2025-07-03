"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/currency";
import { useCart } from "@/modules/cart";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Pizza } from "@/lib/db/schema";
import type { CartItem } from "@/modules/cart/types/cart.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PizzaCashierCardProps {
  pizza: Pizza;
}

export function PizzaCashierCard({ pizza }: PizzaCashierCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    const cartItem: Omit<CartItem, "quantity"> = {
      id: pizza.id,
      name: `${pizza.type} Pizza - ${pizza.nameAr}`,
      price: parseFloat(pizza.priceWithVat),
      category: "Pizza",
    };

    try {
      addItem(cartItem);
      // Small delay for visual feedback
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative bg-card",
        "rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden",
        "cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={handleAddToCart}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {pizza.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(pizza.imageUrl, "pizza")}
            alt={pizza.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
            <span className="text-6xl">🍕</span>
          </div>
        )}

        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Add to Cart Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="lg"
            disabled={isAdding}
            className="bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Pizza Type & Name */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {pizza.type} Pizza
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
            {pizza.nameAr}
          </p>
        </div>

        {/* Crust Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800"
          >
            {pizza.crust}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(pizza.priceWithVat)}
            symbolSize={20}
            variant="primary"
            className="text-2xl font-bold text-green-600 dark:text-green-400"
          />

          {/* Quick Add Button */}
          <Button
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

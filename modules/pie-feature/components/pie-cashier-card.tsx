"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/currency";
import { useCart } from "@/modules/cart";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Pie } from "@/lib/db/schema";
import type { CartItem } from "@/modules/cart/types/cart.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PieCashierCardProps {
  pie: Pie;
}

export function PieCashierCard({ pie }: PieCashierCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    const cartItem: Omit<CartItem, "quantity"> = {
      id: pie.id,
      name: `${pie.type} Pie - ${pie.nameAr}`,
      price: parseFloat(pie.priceWithVat),
      category: "Pie",
      description: `${pie.size} ${pie.type} Pie`,
    };

    try {
      addItem(cartItem);
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
        {pie.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(pie.imageUrl, "pie")}
            alt={pie.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
            <span className="text-6xl">🥧</span>
          </div>
        )}

        {/* Overlay */}
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
        {/* Pie Type & Name */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {pie.type} Pie
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
            {pie.nameAr}
          </p>
        </div>

        {/* Size Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800"
          >
            {pie.size}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(pie.priceWithVat)}
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

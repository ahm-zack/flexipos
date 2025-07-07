"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Sandwich } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AddToCartWithModifiersButton } from "@/components/add-to-cart-with-modifiers-button";

interface SandwichCashierCardProps {
  sandwich: Sandwich;
}

export function SandwichCashierCard({ sandwich }: SandwichCashierCardProps) {
  const [imageError, setImageError] = useState(false);

  const menuItem = {
    id: sandwich.id,
    name: `${sandwich.type} - ${sandwich.nameAr}`,
    price: parseFloat(sandwich.priceWithVat),
    category: "Sandwich",
    description: `${sandwich.size} ${sandwich.type}`,
    image: sandwich.imageUrl,
    itemType: "sandwich" as const,
  };

  return (
    <div
      className={cn(
        "group relative bg-card",
        "rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden",
        "cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {sandwich.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(sandwich.imageUrl, "sandwich")}
            alt={sandwich.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
            <span className="text-6xl">🥪</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Add to Cart Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <AddToCartWithModifiersButton
            item={menuItem}
            size="lg"
            className="bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Sandwich Type & Name */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {sandwich.type}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
            {sandwich.nameAr}
          </p>
        </div>

        {/* Size Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
          >
            {sandwich.size}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(sandwich.priceWithVat)}
            symbolSize={20}
            variant="primary"
            className="text-2xl font-bold text-green-600 dark:text-green-400"
          />

          {/* Quick Add Button */}
          <AddToCartWithModifiersButton
            item={menuItem}
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  );
}

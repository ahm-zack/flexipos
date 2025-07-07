"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { MiniPie } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AddToCartWithModifiersButton } from "@/components/add-to-cart-with-modifiers-button";

interface MiniPieCashierCardProps {
  miniPie: MiniPie;
}

export function MiniPieCashierCard({ miniPie }: MiniPieCashierCardProps) {
  const [imageError, setImageError] = useState(false);

  const menuItem = {
    id: miniPie.id,
    name: `${miniPie.type} - ${miniPie.nameAr}`,
    price: parseFloat(miniPie.priceWithVat),
    category: "Mini Pie",
    description: miniPie.nameEn,
    image: miniPie.imageUrl,
    itemType: "mini_pie" as const,
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
        {miniPie.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(miniPie.imageUrl, "mini-pie")}
            alt={miniPie.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
            <span className="text-6xl">🥧</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Party Only Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg">
            Party Only
          </Badge>
        </div>

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
        {/* Mini Pie Type & Name */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {miniPie.type}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
            {miniPie.nameAr}
          </p>
        </div>

        {/* Size Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200 dark:border-pink-800"
          >
            {miniPie.size}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(miniPie.priceWithVat)}
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

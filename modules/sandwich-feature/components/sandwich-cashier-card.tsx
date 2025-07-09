"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Sandwich } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface SandwichCashierCardProps {
  sandwich: Sandwich;
}

export function SandwichCashierCard({ sandwich }: SandwichCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: sandwich.id,
    name: `${sandwich.type} - ${sandwich.nameAr}`,
    price: parseFloat(sandwich.priceWithVat),
    category: "Sandwich",
    description: `${sandwich.size} ${sandwich.type}`,
    image: sandwich.imageUrl,
    itemType: "sandwich" as const,
    modifiers: sandwich.modifiers || [],
  };

  return (
    <>
      <div
        className={cn(
          "relative bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
        )}
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label={`Add ${sandwich.type} Sandwich to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {sandwich.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(sandwich.imageUrl, "sandwich")}
              alt={sandwich.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
              <span className="text-6xl">🥪</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {sandwich.type}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
              {sandwich.nameAr}
            </p>
          </div>
          {/* Show modifiers if present */}
          {sandwich.modifiers && sandwich.modifiers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {sandwich.modifiers.map((mod) => (
                <Badge
                  key={mod.id}
                  variant={mod.type === "extra" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {mod.type === "extra" ? "+" : "No "} {mod.name}
                  {mod.type === "extra" && mod.price > 0
                    ? ` (+${mod.price})`
                    : ""}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <PriceDisplay
              price={parseFloat(sandwich.priceWithVat)}
              symbolSize={20}
              variant="primary"
              className="text-2xl font-bold text-green-600 dark:text-green-400"
            />
          </div>
        </div>
      </div>
      {modalOpen && (
        <ModifierSelectionDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          item={menuItem}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Appetizer } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";
import { Badge } from "@/components/ui/badge";

interface AppetizerCashierCardProps {
  appetizer: Appetizer;
}

export function AppetizerCashierCard({ appetizer }: AppetizerCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: appetizer.id,
    name: `${appetizer.nameEn} - ${appetizer.nameAr}`,
    price: parseFloat(appetizer.priceWithVat),
    category: "Appetizer",
    description: appetizer.nameEn,
    image: appetizer.imageUrl,
    itemType: "appetizer" as const,
    modifiers: appetizer.modifiers || [],
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
        aria-label={`Add ${appetizer.nameEn} to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {appetizer.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(appetizer.imageUrl, "appetizers")}
              alt={appetizer.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
              <span className="text-6xl">🥟</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {appetizer.nameEn}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
              {appetizer.nameAr}
            </p>
          </div>
          {/* Show modifiers if present */}
          {appetizer.modifiers && appetizer.modifiers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {appetizer.modifiers.map((mod) => (
                <Badge
                  key={mod.id}
                  variant={mod.type === "extra" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {mod.type === "extra" ? "+" : "No "}
                  {mod.name}
                  {mod.type === "extra" && mod.price > 0
                    ? ` (+${mod.price})`
                    : ""}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <PriceDisplay
              price={parseFloat(appetizer.priceWithVat)}
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

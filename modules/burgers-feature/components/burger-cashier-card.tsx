"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Burger } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface BurgerCashierCardProps {
  burger: Burger;
}

export function BurgerCashierCard({ burger }: BurgerCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: burger.id,
    name: `${burger.nameEn} - ${burger.nameAr}`,
    price: parseFloat(burger.priceWithVat),
    category: "Burger",
    description: burger.nameEn,
    image: burger.imageUrl,
    itemType: "burger" as const,
    modifiers: burger.modifiers || [],
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
        aria-label={`Add ${burger.nameEn} to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {burger.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(burger.imageUrl, "burgers")}
              alt={burger.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
              <span className="text-6xl">🍔</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {burger.nameEn}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
              {burger.nameAr}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <PriceDisplay
              price={parseFloat(burger.priceWithVat)}
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

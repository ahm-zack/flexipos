"use client";

import { PriceDisplay } from "@/components/currency";
import type { SideOrder } from "@/lib/db/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getReliableImageUrl } from "@/lib/image-utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface SidesCashierCardProps {
  side: SideOrder;
}

export function SidesCashierCard({ side }: SidesCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: side.id,
    name: `${side.nameEn} - ${side.nameAr}`,
    nameEn: side.nameEn,
    nameAr: side.nameAr,
    price: parseFloat(side.priceWithVat),
    category: "Side",
    description: side.nameEn,
    image: side.imageUrl,
    itemType: "side-order" as const,
    modifiers: side.modifiers || [],
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
        aria-label={`Add ${side.nameEn} to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {side.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(side.imageUrl, "sides")}
              alt={side.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
              <span className="text-6xl">🍟</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {side.nameEn}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
              {side.nameAr}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <PriceDisplay
              price={parseFloat(side.priceWithVat)}
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

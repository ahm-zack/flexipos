"use client";

import { PriceDisplay } from "@/components/currency";
import type { Shawarma } from "@/lib/db/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getReliableImageUrl } from "@/lib/image-utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface ShawermaCashierCardProps {
  shawarma: Shawarma;
}

export function ShawermaCashierCard({ shawarma }: ShawermaCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: shawarma.id,
    name: `${shawarma.nameEn} - ${shawarma.nameAr}`,
    nameEn: shawarma.nameEn,
    nameAr: shawarma.nameAr,
    price: parseFloat(shawarma.priceWithVat),
    category: "Shawarma",
    description: shawarma.nameEn,
    image: shawarma.imageUrl,
    itemType: "shawerma" as const,
    modifiers: shawarma.modifiers || [],
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
        aria-label={`Add ${shawarma.nameEn} to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {shawarma.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(shawarma.imageUrl, "shawarmas")}
              alt={shawarma.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
              <span className="text-6xl">🌯</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {shawarma.nameEn}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
              {shawarma.nameAr}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <PriceDisplay
              price={parseFloat(shawarma.priceWithVat)}
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

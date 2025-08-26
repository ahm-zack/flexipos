"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Pie } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface PieCashierCardProps {
  pie: Pie;
}

export function PieCashierCard({ pie }: PieCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: pie.id,
    name: `${pie.nameEn} - ${pie.nameAr}`,
    nameEn: pie.nameEn,
    nameAr: pie.nameAr,
    price: parseFloat(pie.priceWithVat),
    category: "Pie",
    description: `${pie.size} ${pie.nameEn} Pie`,
    image: pie.imageUrl,
    itemType: "pie" as const,
    modifiers: pie.modifiers || [],
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
        aria-label={`Add ${pie.type} Pie to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {pie.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(pie.imageUrl, "pie")}
              alt={pie.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
              <span className="text-6xl">🧇</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {pie.nameEn}
            </h3>
            <p
              className="text-gray-600 dark:text-gray-300 line-clamp-1"
              dir="rtl"
            >
              {pie.nameAr}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <PriceDisplay
              price={parseFloat(pie.priceWithVat)}
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

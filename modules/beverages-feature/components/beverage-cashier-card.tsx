"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Beverage } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";
import { Badge } from "@/components/ui/badge";

interface BeverageCashierCardProps {
  beverage: Beverage;
}

export function BeverageCashierCard({ beverage }: BeverageCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: beverage.id,
    name: `${beverage.nameEn} - ${beverage.nameAr}`,
    price: parseFloat(beverage.priceWithVat),
    category: "Beverage",
    description: beverage.nameEn,
    image: beverage.imageUrl,
    itemType: "baverages" as const,
    modifiers: beverage.modifiers || [],
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
        aria-label={`Add ${beverage.nameEn} to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {beverage.imageUrl && !imageError ? (
            <Image
              src={getReliableImageUrl(beverage.imageUrl, "beverages")}
              alt={beverage.nameEn}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
              <span className="text-6xl">🥤</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {beverage.nameEn}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
              {beverage.nameAr}
            </p>
          </div>
          {/* Show modifiers if present */}
          {beverage.modifiers && beverage.modifiers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {beverage.modifiers.map((mod) => (
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
              price={parseFloat(beverage.priceWithVat)}
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

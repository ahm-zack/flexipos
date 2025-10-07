"use client";

import { useState } from "react";
import Image from "next/image";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Product } from "../services/product-supabase-service";
import { cn } from "@/lib/utils";
import { ModifierSelectionDialog } from "@/components/modifier-selection-dialog";

interface ProductCashierCardProps {
  product: Product;
}

export function ProductCashierCard({ product }: ProductCashierCardProps) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItem = {
    id: product.id,
    name: `${product.name} - ${product.nameAr || product.name}`,
    nameEn: product.name,
    nameAr: product.nameAr || product.name,
    price: product.price,
    category: "Product",
    description: product.description || product.name,
    image: product.images?.[0] || "",
    itemType: "side-order" as const,
    modifiers: (product.modifiers || []).map((mod) => ({
      id: mod.id,
      type: (mod.type === "single" ? "extra" : "without") as
        | "extra"
        | "without",
      name: mod.name,
      price: mod.options?.[0]?.price || 0,
    })),
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
        aria-label={`Add ${product.name} to cart`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {product.images?.[0] && !imageError ? (
            <Image
              src={getReliableImageUrl(product.images[0], "product")}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
              <span className="text-6xl">🛍️</span>
            </div>
          )}
        </div>
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {product.name}
            </h3>
            <p
              className="text-gray-600 dark:text-gray-300 line-clamp-1"
              dir="rtl"
            >
              {product.nameAr || product.name}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <PriceDisplay
              price={product.price}
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

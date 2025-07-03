"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency";
import { useCart } from "@/modules/cart";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Pie } from "@/lib/db/schema";
import type { CartItem } from "@/modules/cart/types/cart.types";

interface PieCardProps {
  pie: Pie;
  onEdit?: (pie: Pie) => void;
  onDelete?: (pie: Pie) => void;
  showActions?: boolean;
  showCartActions?: boolean;
}

export function PieCard({
  pie,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
}: PieCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    const cartItem: Omit<CartItem, "quantity"> = {
      id: pie.id,
      name: `${pie.type} Pie - ${pie.nameAr}`,
      price: parseFloat(pie.priceWithVat),
      category: "Pie",
      description: `${pie.size} ${pie.type} Pie`,
    };

    try {
      addItem(cartItem);
      // Small delay for visual feedback
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`bg-card rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-200 ${
        showActions || (showCartActions && showActions)
          ? "h-[480px]"
          : "h-auto min-h-[400px]"
      } flex flex-col ${
        showCartActions && !showActions ? "cursor-pointer" : ""
      }`}
      onClick={showCartActions && !showActions ? handleAddToCart : undefined}
    >
      {/* Pie Image */}
      <div className="aspect-video bg-card flex items-center justify-center relative flex-shrink-0">
        {pie.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(pie.imageUrl, "pie")}
            alt={pie.nameEn}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">🥧</div>
        )}
      </div>

      {/* Pie Details */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Bilingual Title */}
          <div className="flex-shrink-0">
            <h3 className="text-xl font-bold text-foreground line-clamp-1">
              {pie.type} Pie
            </h3>
            <h3 className="text-lg text-muted-foreground mt-1 line-clamp-1">
              {pie.nameAr}
            </h3>
          </div>

          {/* Size Badge */}
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant="secondary" className="capitalize">
              {pie.size}
            </Badge>
          </div>

          {/* Price Display */}
          <div className="text-2xl font-bold flex-shrink-0">
            <PriceDisplay
              price={parseFloat(pie.priceWithVat)}
              symbolSize={18}
              variant="primary"
              className="text-2xl font-bold"
            />
          </div>

          {/* Action Buttons */}
          {(showActions || (showCartActions && showActions)) && (
            <div className="flex gap-3 pt-2 mt-auto">
              {showActions && (
                <>
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(pie)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 flex-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(pie)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </>
              )}

              {showCartActions && showActions && (
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex items-center gap-2 flex-1"
                >
                  <Plus className="h-4 w-4" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/currency";
import { useCart } from "@/modules/cart";
import type { Pizza } from "@/lib/db/schema";
import type { CartItem } from "@/modules/cart/types/cart.types";

interface PizzaCardProps {
  pizza: Pizza;
  onEdit?: (pizza: Pizza) => void;
  onDelete?: (pizza: Pizza) => void;
  showActions?: boolean;
  showCartActions?: boolean;
}

export function PizzaCard({
  pizza,
  onEdit,
  onDelete,
  showActions = true,
  showCartActions = true,
}: PizzaCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    const cartItem: Omit<CartItem, "quantity"> = {
      id: pizza.id,
      name: `${pizza.type} Pizza - ${pizza.nameAr} بيتزا`,
      price: parseFloat(pizza.priceWithVat),
      category: "Pizza",
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
    <div className="bg-card rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-200">
      {/* Pizza Image */}
      <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center relative">
        {pizza.imageUrl && !imageError ? (
          <Image
            src={pizza.imageUrl}
            alt={pizza.nameEn}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">🍕</div>
        )}
      </div>

      {/* Pizza Details */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Pizza Type as Title */}
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {pizza.type} Pizza
            </h3>
            <p className="text-lg text-muted-foreground mt-1">
              {pizza.nameAr} بيتزا
            </p>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold">
            <PriceDisplay
              price={parseFloat(pizza.priceWithVat)}
              symbolSize={18}
              variant="primary"
              className="text-2xl font-bold"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {showActions && (
              <>
                {onEdit && (
                  <Button
                    onClick={() => onEdit(pizza)}
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
                    onClick={() => onDelete(pizza)}
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

            {showCartActions && (
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
        </div>
      </div>
    </div>
  );
}

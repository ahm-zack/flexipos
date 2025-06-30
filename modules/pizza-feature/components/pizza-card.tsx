"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      name: pizza.nameEn,
      price: parseFloat(pizza.priceWithVat),
      category: "Pizza",
      description: `${pizza.type} - ${pizza.crust || "Standard"} Crust${
        pizza.extras ? ` with ${pizza.extras}` : ""
      }`,
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Margherita:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Pepperoni: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Vegetable:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Mortadella:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Chicken:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  const getCrustColor = (crust: string | null) => {
    if (!crust)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

    const colors: Record<string, string> = {
      original:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      thin: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return (
      colors[crust] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
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

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(pizza)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(pizza)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Plus className="mr-2 h-4 w-4 rotate-45" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Pizza Details */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Names */}
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {pizza.nameEn}
            </h3>
            <p className="text-sm text-muted-foreground">{pizza.nameAr}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getTypeColor(pizza.type)}>{pizza.type}</Badge>
            <Badge className={getCrustColor(pizza.crust)}>
              {pizza.crust || "Standard"} Crust
            </Badge>
            {pizza.extras && <Badge variant="outline">{pizza.extras}</Badge>}
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold">
              <PriceDisplay
                price={parseFloat(pizza.priceWithVat)}
                symbolSize={18}
                variant="primary"
                className="text-2xl font-bold"
              />
            </div>

            {showCartActions && (
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex items-center gap-2"
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

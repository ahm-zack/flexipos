"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "../services/product-supabase-service";

interface ProductCashierCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  quantity?: number;
  onQuantityChange?: (productId: string, quantity: number) => void;
}

export function ProductCashierCard({
  product,
  onAddToCart,
  quantity = 0,
  onQuantityChange,
}: ProductCashierCardProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const finalQuantity = Math.max(0, newQuantity);
    setLocalQuantity(finalQuantity);
    onQuantityChange?.(product.id, finalQuantity);
  };

  const handleAddToCart = () => {
    if (onAddToCart && localQuantity > 0) {
      onAddToCart(product, localQuantity);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Available" : "Unavailable"}
          </Badge>
        </div>
        {product.nameAr && (
          <p className="text-sm text-muted-foreground" dir="rtl">
            {product.nameAr}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {product.images && product.images.length > 0 && (
          <div className="aspect-square mb-3 rounded-md overflow-hidden bg-muted">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="text-center">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 text-center">
              {product.description}
            </p>
          )}

          {product.variants && product.variants.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {product.variants.length} size
              {product.variants.length > 1 ? "s" : ""} available
            </p>
          )}

          {product.modifiers && product.modifiers.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Customizable with {product.modifiers.length} option
              {product.modifiers.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex flex-col gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(localQuantity - 1)}
            disabled={localQuantity <= 0 || !product.isActive}
          >
            <Minus className="w-4 h-4" />
          </Button>

          <span className="min-w-[2rem] text-center font-medium">
            {localQuantity}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(localQuantity + 1)}
            disabled={!product.isActive}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={localQuantity <= 0 || !product.isActive}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

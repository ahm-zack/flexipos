"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReliableImageUrl } from "@/lib/image-utils";
import { Edit, Trash2, Package, Star, Layers } from "lucide-react";
import { SaudiRiyalSymbol } from "@/components/currency";
import type { Product } from "../services/product-supabase-service";

interface ProductManagementCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductManagementCard({
  product,
  onEdit,
  onDelete,
}: ProductManagementCardProps) {
  const stockQty = product.stockQuantity ?? 0;
  const hasStock =
    product.stockQuantity !== undefined && product.stockQuantity !== null
      ? stockQty > 0
      : true;

  return (
    <div className="group relative bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Product Image */}
      <div className="relative h-44 bg-muted">
        {product.images && product.images.length > 0 ? (
          <Image
            src={getReliableImageUrl(product.images[0], "product")}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="w-10 h-10 opacity-30" />
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Floating badges top-right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {product.isFeatured && (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] px-1.5 py-0 gap-1">
              <Star className="w-2.5 h-2.5 fill-white" />
              Featured
            </Badge>
          )}
          {product.modifiers && product.modifiers.length > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 gap-1"
            >
              <Layers className="w-2.5 h-2.5" />
              Modifiers
            </Badge>
          )}
        </div>

        {/* Status dot top-left */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              product.isActive
                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-muted-foreground"}`}
            />
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Names */}
        <div>
          <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-1">
            {product.name}
          </h3>
          {product.nameAr && (
            <p
              className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
              dir="rtl"
            >
              {product.nameAr}
            </p>
          )}
        </div>

        {/* Price + Stock row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-bold text-foreground">
            <SaudiRiyalSymbol size={14} className="text-primary mt-0.5" />
            <span>{product.price.toFixed(2)}</span>
          </div>
          {product.stockQuantity !== undefined &&
            product.stockQuantity !== null && (
              <Badge
                variant={hasStock ? "outline" : "destructive"}
                className={`text-[10px] ${hasStock ? "border-green-500 text-green-700 dark:text-green-400" : ""}`}
              >
                {hasStock ? `Stock: ${stockQty}` : "Out of Stock"}
              </Badge>
            )}
        </div>

        {/* Description snippet */}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {onEdit && (
            <Button
              onClick={() => onEdit(product)}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(product)}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

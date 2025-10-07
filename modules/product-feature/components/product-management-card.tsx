"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReliableImageUrl } from "@/lib/image-utils";
import { Edit, Trash2 } from "lucide-react";
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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {product.images && product.images.length > 0 ? (
          <Image
            src={getReliableImageUrl(product.images[0], "product")}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Product Names */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
            {product.nameAr}
          </p>
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
          >
            {product.categoryId}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${product.price.toFixed(2)}
          </span>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.isActive ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(product)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(product)}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

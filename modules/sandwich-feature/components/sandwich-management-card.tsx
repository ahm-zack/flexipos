"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Sandwich } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SandwichManagementCardProps {
  sandwich: Sandwich;
  onEdit?: (sandwich: Sandwich) => void;
  onDelete?: (sandwich: Sandwich) => void;
}

export function SandwichManagementCard({
  sandwich,
  onEdit,
  onDelete,
}: SandwichManagementCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        "group relative bg-card",
        "rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden",
        "transform hover:scale-[1.01]"
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {sandwich.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(sandwich.imageUrl, "sandwich")}
            alt={sandwich.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
            <span className="text-6xl">🥪</span>
          </div>
        )}

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(sandwich)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Sandwich
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(sandwich)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Sandwich
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Sandwich Name - Bilingual Display */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {sandwich.nameEn}
          </h3>
          <p
            className="text-gray-600 dark:text-gray-300 line-clamp-1"
            dir="rtl"
          >
            {sandwich.nameAr}
          </p>
        </div>

        {/* Size Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
          >
            {sandwich.size}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(sandwich.priceWithVat)}
            symbolSize={20}
            variant="primary"
            className="text-2xl font-bold text-green-600 dark:text-green-400"
          />

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(sandwich)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-yellow-50 hover:border-yellow-300 dark:hover:bg-yellow-900/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(sandwich)}
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

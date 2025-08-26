"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { Pie } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PieManagementCardProps {
  pie: Pie;
  onEdit?: (pie: Pie) => void;
  onDelete?: (pie: Pie) => void;
}

export function PieManagementCard({
  pie,
  onEdit,
  onDelete,
}: PieManagementCardProps) {
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
        {pie.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(pie.imageUrl, "pie")}
            alt={pie.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
            <span className="text-6xl">🥧</span>
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
                <DropdownMenuItem onClick={() => onEdit(pie)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Pie
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(pie)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Pie
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Pie Name - Bilingual Display */}
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

        {/* Size Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800"
          >
            {pie.size}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(pie.priceWithVat)}
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
              onClick={() => onEdit(pie)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(pie)}
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

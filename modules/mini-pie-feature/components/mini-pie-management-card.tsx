"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/currency";
import { getReliableImageUrl } from "@/lib/image-utils";
import type { MiniPie } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MiniPieManagementCardProps {
  miniPie: MiniPie;
  onEdit?: (miniPie: MiniPie) => void;
  onDelete?: (miniPie: MiniPie) => void;
}

export function MiniPieManagementCard({
  miniPie,
  onEdit,
  onDelete,
}: MiniPieManagementCardProps) {
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
        {miniPie.imageUrl && !imageError ? (
          <Image
            src={getReliableImageUrl(miniPie.imageUrl, "mini-pie")}
            alt={miniPie.nameEn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
            <span className="text-6xl">🥧</span>
          </div>
        )}

        {/* Party Only Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg">
            Party Only
          </Badge>
        </div>

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
                <DropdownMenuItem onClick={() => onEdit(miniPie)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Mini Pie
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(miniPie)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Mini Pie
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Mini Pie Type & Name */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {miniPie.type}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-1">
            {miniPie.nameAr}
          </p>
        </div>

        {/* Size Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200 dark:border-pink-800"
          >
            {miniPie.size}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={parseFloat(miniPie.priceWithVat)}
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
              onClick={() => onEdit(miniPie)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-pink-50 hover:border-pink-300 dark:hover:bg-pink-900/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(miniPie)}
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

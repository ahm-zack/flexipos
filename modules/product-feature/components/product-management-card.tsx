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
import { Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import type { Product } from "../services/product-supabase-service";

interface ProductManagementCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
}

export function ProductManagementCard({
  product,
  onEdit,
  onDelete,
  onView,
}: ProductManagementCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Active" : "Inactive"}
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
          <div className="aspect-video mb-3 rounded-md overflow-hidden bg-muted">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {product.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {product.variants && product.variants.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {product.variants.length} variant
              {product.variants.length > 1 ? "s" : ""}
            </p>
          )}

          {product.modifiers && product.modifiers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {product.modifiers.length} modifier
              {product.modifiers.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(product)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

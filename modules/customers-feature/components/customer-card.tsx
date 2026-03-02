"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency";
import {
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Edit3,
  Trash2,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Customer } from "../hooks/use-customers";

interface CustomerCardProps {
  customer: Customer;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

export function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  const t = useTranslations("customers");
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {customer.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{customer.name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(customer)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(customer)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-1.5 text-sm">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("card.orders")}</span>
            <Badge variant="secondary" className="font-mono">
              {customer.order_count}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("card.total")}</span>
            <span className="font-semibold">
              <PriceDisplay price={Number(customer.total_purchases)} />
            </span>
          </div>
        </div>

        {customer.last_order_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3" />
            <span>
              {t("card.lastOrder")}{" "}
              {formatDistanceToNow(new Date(customer.last_order_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

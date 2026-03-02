"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceDisplay } from "@/components/currency";
import { Users, TrendingUp, ShoppingBag } from "lucide-react";
import type { Customer } from "../hooks/use-customers";

interface CustomersStatsProps {
  customers: Customer[];
}

export function CustomersStats({ customers }: CustomersStatsProps) {
  const t = useTranslations("customers");
  const totalRevenue = customers.reduce(
    (sum, c) => sum + Number(c.total_purchases),
    0,
  );
  const totalOrders = customers.reduce((sum, c) => sum + c.order_count, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("stats.total")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{customers.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("stats.totalRevenue")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            <PriceDisplay price={totalRevenue} />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            {t("stats.avgOrderValue")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            <PriceDisplay price={avgOrderValue} />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

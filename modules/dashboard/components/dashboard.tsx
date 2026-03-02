"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import type { DashboardMetrics } from "../hooks/use-dashboard-metrics";
import {
  TrendingUp,
  ShoppingCart,
  Banknote,
  CreditCard,
  Truck,
  BarChart3,
  Layers,
  AlertCircle,
  Bike,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SAR = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

// ─── Period tab type ──────────────────────────────────────────────────────────
type Period = "today" | "week" | "month" | "alltime";

interface PeriodData {
  revenue: number;
  orders: number;
  cash: number;
  card: number;
  mixed: number;
  delivery: number;
  keeta: number;
  hunger_station: number;
  jahez: number;
}

function getPeriodData(m: DashboardMetrics, period: Period): PeriodData {
  switch (period) {
    case "today":
      return {
        revenue: m.daily_total,
        orders: m.daily_orders,
        cash: m.daily_cash,
        card: m.daily_card,
        mixed: m.daily_mixed,
        delivery: m.daily_keeta + m.daily_hunger_station + m.daily_jahez,
        keeta: m.daily_keeta,
        hunger_station: m.daily_hunger_station,
        jahez: m.daily_jahez,
      };
    case "week":
      return {
        revenue: m.weekly_total,
        orders: m.weekly_orders,
        cash: m.weekly_cash,
        card: m.weekly_card,
        mixed: m.weekly_mixed,
        delivery: m.weekly_keeta + m.weekly_hunger_station + m.weekly_jahez,
        keeta: m.weekly_keeta,
        hunger_station: m.weekly_hunger_station,
        jahez: m.weekly_jahez,
      };
    case "month":
      return {
        revenue: m.monthly_total,
        orders: m.monthly_orders,
        cash: m.monthly_cash,
        card: m.monthly_card,
        mixed: m.monthly_mixed,
        delivery: m.monthly_keeta + m.monthly_hunger_station + m.monthly_jahez,
        keeta: m.monthly_keeta,
        hunger_station: m.monthly_hunger_station,
        jahez: m.monthly_jahez,
      };
    case "alltime":
    default:
      return {
        revenue: m.total_revenue,
        orders: m.total_orders,
        cash: m.cash_total,
        card: m.card_total,
        mixed: m.mixed_cash_total + m.mixed_card_total,
        delivery: m.delivery_total,
        keeta: m.delivery_keeta_total,
        hunger_station: m.delivery_hunger_station_total,
        jahez: m.delivery_jahez_total,
      };
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────
type CardColor = "green" | "blue" | "purple" | "orange";

const COLOR: Record<
  CardColor,
  { border: string; bg: string; icon: string; value: string }
> = {
  green: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  blue: {
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-500/10",
    icon: "text-blue-500",
    value: "text-blue-700 dark:text-blue-300",
  },
  purple: {
    border: "border-violet-200 dark:border-violet-800",
    bg: "bg-violet-500/10",
    icon: "text-violet-500",
    value: "text-violet-700 dark:text-violet-300",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-800",
    bg: "bg-orange-500/10",
    icon: "text-orange-500",
    value: "text-orange-700 dark:text-orange-300",
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  currency = false,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: CardColor;
  currency?: boolean;
  sub?: string;
}) {
  const c = COLOR[color];
  return (
    <div
      className={cn(
        "rounded-xl border p-4 bg-background shadow-sm space-y-3",
        c.border,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div className={cn("p-2 rounded-lg", c.bg)}>
          <Icon className={cn("h-4 w-4", c.icon)} />
        </div>
      </div>
      <p className={cn("text-2xl font-bold tracking-tight", c.value)}>
        {currency ? (
          <span className="flex items-center gap-1">
            <SaudiRiyalSymbol className="h-4 w-4 opacity-70" />
            {SAR(value as number)}
          </span>
        ) : (
          value
        )}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Payment bar ──────────────────────────────────────────────────────────────
function PayBar({
  label,
  amount,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
  icon: React.ElementType;
}) {
  const p = pct(amount, total);
  if (amount === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground text-xs">{p}%</span>
        </div>
        <span className="font-semibold flex items-center gap-0.5">
          <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
          {SAR(amount)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 bg-current",
            color,
          )}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
      </CardHeader>
      <Separator className="mx-5 mb-0" style={{ width: "calc(100% - 40px)" }} />
      <CardContent className="px-5 pt-4 pb-5">{children}</CardContent>
    </Card>
  );
}

// ─── Period tabs ──────────────────────────────────────────────────────────────
const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "alltime", label: "All Time" },
];

// ─── Empty state (no metrics row yet, i.e. no orders ever placed) ─────────────
function EmptyState() {
  return (
    <div className="text-center py-20 space-y-4">
      <div className="p-5 bg-muted rounded-full w-fit mx-auto">
        <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <div>
        <p className="text-base font-semibold">No data yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Dashboard metrics will appear here once you start taking orders.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="h-40 rounded-xl bg-muted animate-pulse" />
          <div className="h-40 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 rounded-xl p-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load dashboard metrics. {(error as Error).message}
        </div>
      </div>
    );
  }

  const d = metrics ? getPeriodData(metrics, period) : null;
  const avgOrder = d && d.orders > 0 ? d.revenue / d.orders : 0;
  const payTotal = d ? d.cash + d.card + d.mixed + d.delivery : 0;
  const delivTotal = d ? d.keeta + d.hunger_station + d.jahez : 0;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time business performance
          </p>
        </div>
        {/* Realtime live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live
        </div>
      </div>

      {/* ── Period selector ───────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              period === key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── No data state ────────────────────────────────────────────────── */}
      {!metrics && <EmptyState />}

      {/* ── Metrics content ──────────────────────────────────────────────── */}
      {metrics && d && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Revenue"
              value={d.revenue}
              icon={TrendingUp}
              color="green"
              currency
            />
            <StatCard
              label="Orders"
              value={d.orders}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              label="Avg. Order"
              value={avgOrder}
              icon={BarChart3}
              color="purple"
              currency
            />
            <StatCard
              label="Delivery Revenue"
              value={d.delivery}
              icon={Truck}
              color="orange"
              currency
            />
          </div>

          {/* Payment + Delivery grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Payment breakdown */}
            <Section title="Payment Methods" icon={Layers}>
              {payTotal === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders in this period
                </p>
              ) : (
                <div className="space-y-4">
                  <PayBar
                    label="Cash"
                    amount={d.cash}
                    total={payTotal}
                    color="text-emerald-500"
                    icon={Banknote}
                  />
                  <PayBar
                    label="Card"
                    amount={d.card}
                    total={payTotal}
                    color="text-blue-500"
                    icon={CreditCard}
                  />
                  <PayBar
                    label="Mixed"
                    amount={d.mixed}
                    total={payTotal}
                    color="text-violet-500"
                    icon={Zap}
                  />
                  <PayBar
                    label="Delivery"
                    amount={d.delivery}
                    total={payTotal}
                    color="text-orange-500"
                    icon={Truck}
                  />
                </div>
              )}
            </Section>

            {/* Delivery platform breakdown */}
            <Section title="Delivery Platforms" icon={Truck}>
              {delivTotal === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No delivery orders in this period
                </p>
              ) : (
                <div className="space-y-4">
                  <PayBar
                    label="Keeta"
                    amount={d.keeta}
                    total={delivTotal}
                    color="text-red-500"
                    icon={Bike}
                  />
                  <PayBar
                    label="Hunger Station"
                    amount={d.hunger_station}
                    total={delivTotal}
                    color="text-orange-500"
                    icon={Flame}
                  />
                  <PayBar
                    label="Jahez"
                    amount={d.jahez}
                    total={delivTotal}
                    color="text-yellow-500"
                    icon={Truck}
                  />
                </div>
              )}
            </Section>
          </div>

          {/* All-time quick stats strip */}
          {period !== "alltime" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/50 bg-background p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  All-Time Revenue
                </p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <SaudiRiyalSymbol className="h-3.5 w-3.5 opacity-60" />
                  {SAR(metrics.total_revenue)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  All-Time Orders
                </p>
                <p className="text-lg font-bold">{metrics.total_orders}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Total Delivery
                </p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <SaudiRiyalSymbol className="h-3.5 w-3.5 opacity-60" />
                  {SAR(metrics.delivery_total)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Mixed Payments
                </p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <SaudiRiyalSymbol className="h-3.5 w-3.5 opacity-60" />
                  {SAR(metrics.mixed_cash_total + metrics.mixed_card_total)}
                </p>
              </div>
            </div>
          )}

          {/* Footer timestamp */}
          <p className="text-xs text-muted-foreground text-right">
            Last updated{" "}
            {new Date(metrics.updated_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

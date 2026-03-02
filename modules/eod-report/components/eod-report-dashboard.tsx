"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import {
  useSmartEODPreview,
  useGenerateEODReport,
  useEODReportHistory,
  useDeleteEODReport,
} from "../hooks/use-eod-reports";
import type { SavedEODReport } from "@/lib/reports/types";
import {
  FileText,
  TrendingUp,
  ShoppingCart,
  Clock,
  Banknote,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ChevronRight,
  Package,
  BarChart3,
  Zap,
  ArrowLeft,
  Calendar,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vatUtils } from "@/lib/vat-config";
import { toast } from "sonner";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtShortDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Stat card ────────────────────────────────────────────────────────────────
type CardColor = "blue" | "green" | "orange" | "purple" | "red" | "teal";

const COLOR_MAP: Record<
  CardColor,
  { icon: string; value: string; bg: string; border: string }
> = {
  blue: {
    icon: "text-blue-500",
    value: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-800",
  },
  green: {
    icon: "text-emerald-500",
    value: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  orange: {
    icon: "text-orange-500",
    value: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-800",
  },
  purple: {
    icon: "text-violet-500",
    value: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-800",
  },
  red: {
    icon: "text-rose-500",
    value: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-800",
  },
  teal: {
    icon: "text-teal-500",
    value: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-500/10",
    border: "border-teal-200 dark:border-teal-800",
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
  const c = COLOR_MAP[color];
  return (
    <div
      className={cn(
        "rounded-xl border p-4 bg-background space-y-3 shadow-sm",
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
            {fmt(value)}
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
const PAY_COLORS: Record<string, { bar: string; icon: string; bg: string }> = {
  cash: {
    bar: "bg-emerald-500",
    icon: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  card: { bar: "bg-blue-500", icon: "text-blue-500", bg: "bg-blue-500/10" },
  delivery: {
    bar: "bg-orange-500",
    icon: "text-orange-500",
    bg: "bg-orange-500/10",
  },
};

const PAY_ICONS: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  delivery: Truck,
};

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
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
      </CardHeader>
      <Separator className="mx-5 mb-0" style={{ width: "calc(100% - 40px)" }} />
      <CardContent className="px-5 pt-4 pb-5">{children}</CardContent>
    </Card>
  );
}

// ─── Report View ──────────────────────────────────────────────────────────────
function ReportView({ report }: { report: SavedEODReport }) {
  const t = useTranslations("reports");
  const topItems = Array.isArray(report.top_items)
    ? report.top_items.slice(0, 10)
    : [];
  const catBreak = Array.isArray(report.category_breakdown)
    ? report.category_breakdown
    : [];
  const hourly = Array.isArray(report.hourly_sales)
    ? (report.hourly_sales as Array<{
        hour: number;
        label: string;
        orderCount: number;
        revenue: number;
      }>)
    : [];
  const payBreak = Array.isArray(report.payment_breakdown)
    ? report.payment_breakdown
    : [];
  const maxRevenue = Math.max(...hourly.map((h) => h.revenue), 1);

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">
            {t("eod.reportLabel")}
          </p>
          <h2 className="text-xl font-bold">{report.report_number}</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {fmtShortDate(report.period_start)}
            <span className="text-border">→</span>
            {fmtShortDate(report.period_end)}
          </p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1.5 px-3 py-1.5 text-xs font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t("completed")}
        </Badge>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={t("totalRevenue")}
          value={report.total_revenue}
          icon={TrendingUp}
          color="green"
          currency
        />
        <StatCard
          label={t("totalOrders")}
          value={report.completed_orders}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          label={t("avgOrder")}
          value={report.average_order_value}
          icon={BarChart3}
          color="purple"
          currency
        />
        <StatCard
          label={t("cancelled")}
          value={report.cancelled_orders}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Revenue split */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label={t("cash")}
          value={report.cash_revenue}
          icon={Banknote}
          color="green"
          currency
        />
        <StatCard
          label={t("card")}
          value={report.card_revenue}
          icon={CreditCard}
          color="blue"
          currency
        />
        <StatCard
          label={t("delivery")}
          value={report.delivery_revenue}
          icon={Truck}
          color="orange"
          currency
        />
      </div>

      {/* VAT */}
      {vatUtils.shouldShowVAT() && (
        <Section title={t("eod.vatBreakdown")}>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: t("revenueInclVat"), value: report.total_revenue },
              { label: t("vatAmount"), value: report.total_vat },
              { label: t("revenueExclVat"), value: report.revenue_ex_vat },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-bold text-sm flex items-center gap-1">
                  <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
                  {fmt(value)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Payment breakdown */}
      {payBreak.length > 0 && (
        <Section title={t("paymentMethods")} icon={CreditCard}>
          <div className="space-y-4">
            {payBreak.map((p) => {
              const Icon = PAY_ICONS[p.method] ?? Banknote;
              const pc = PAY_COLORS[p.method] ?? PAY_COLORS.cash;
              return (
                <div key={p.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-md", pc.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", pc.icon)} />
                      </div>
                      <span className="capitalize font-medium">{p.method}</span>
                      <span className="text-muted-foreground text-xs">
                        ({p.orderCount} orders)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {p.percentage.toFixed(1)}%
                      </span>
                      <span className="font-semibold flex items-center gap-0.5">
                        <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
                        {fmt(p.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pc.bar,
                      )}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Top items */}
      {topItems.length > 0 && (
        <Section title={t("topSellingItems")} icon={Package}>
          <div className="space-y-2">
            {topItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                    i === 0
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                      : i === 1
                        ? "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                        : i === 2
                          ? "bg-orange-500/15 text-orange-700 dark:text-orange-400"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium truncate">
                  {item.name}
                </span>
                {item.categoryName && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] px-2 py-0 shrink-0"
                  >
                    {item.categoryName}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground shrink-0">
                  ×{item.quantity}
                </span>
                <span className="text-sm font-semibold min-w-[72px] text-right flex items-center justify-end gap-0.5">
                  <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
                  {fmt(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Category breakdown */}
      {catBreak.length > 0 && (
        <Section title={t("categoryBreakdown")} icon={BarChart3}>
          <div className="space-y-2">
            {catBreak.map((cat, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">
                  {cat.categoryName}
                </span>
                <span className="text-sm font-semibold flex items-center gap-0.5">
                  <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
                  {fmt(cat.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Hourly chart */}
      {hourly.some((h) => h.orderCount > 0) && (
        <Section title={t("hourlyActivity")} icon={Clock}>
          <div className="flex items-end gap-px h-24">
            {hourly.map((h) => (
              <div
                key={h.hour}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div
                  className={cn(
                    "w-full rounded-sm transition-colors cursor-default",
                    h.orderCount > 0
                      ? "bg-primary/25 hover:bg-primary/50"
                      : "bg-muted/50",
                  )}
                  style={{
                    height: `${Math.max(3, (h.revenue / maxRevenue) * 100)}%`,
                    minHeight: h.orderCount > 0 ? "4px" : "2px",
                  }}
                />
                {h.orderCount > 0 && (
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-popover border rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md pointer-events-none">
                    <span className="font-medium">{h.label}</span>
                    <span className="text-muted-foreground ml-1">·</span>
                    <span className="text-muted-foreground ml-1">
                      {h.orderCount} {t("orders")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-px">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────
function HistoryRow({
  report,
  onSelect,
  onDelete,
}: {
  report: SavedEODReport;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("reports");
  return (
    <div
      className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-background hover:border-border hover:shadow-sm transition-all duration-150 cursor-pointer"
      onClick={onSelect}
    >
      <div className="p-2.5 bg-blue-500/10 rounded-xl shrink-0">
        <FileText className="h-4 w-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{report.report_number}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fmtShortDate(report.period_start)} →{" "}
          {fmtShortDate(report.period_end)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold flex items-center gap-0.5 justify-end">
          <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
          {fmt(report.total_revenue)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {report.completed_orders} {t("orders")}
        </p>
      </div>
      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onSelect}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function EODReportDashboard() {
  const t = useTranslations("reports");
  const [selectedReport, setSelectedReport] = useState<SavedEODReport | null>(
    null,
  );
  const [view, setView] = useState<"generate" | "history">("generate");
  const [historyPage, setHistoryPage] = useState(1);

  const preview = useSmartEODPreview();
  const generate = useGenerateEODReport();
  const history = useEODReportHistory(historyPage);
  const deleteReport = useDeleteEODReport();

  const handleGenerate = () => {
    generate.mutate(undefined, {
      onSuccess: (report) => {
        setSelectedReport(report);
        toast.success(
          `${report.report_number} ${t("tabGenerate").toLowerCase()}`,
        );
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : t("eod.failedGenerate"),
        ),
    });
  };

  const handleDelete = (reportId: string) => {
    if (!confirm(t("eod.confirmDelete"))) return;
    deleteReport.mutate(reportId, {
      onSuccess: () => {
        toast.success(t("reportDeleted"));
        if (selectedReport?.id === reportId) setSelectedReport(null);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : t("eod.failedDelete")),
    });
  };

  return (
    <div className="space-y-5">
      {/* Tab strip */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {(["generate", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setView(tab);
              setSelectedReport(null);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              view === tab
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "generate" ? (
              <Zap className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {tab === "generate" ? t("tabGenerate") : t("tabSaved")}
          </button>
        ))}
      </div>

      {/* ── Generate tab ── */}
      {view === "generate" && (
        <div className="space-y-5">
          {selectedReport ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReport(null)}
                className="gap-1.5 -ml-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
              </Button>
              <ReportView report={selectedReport} />
            </>
          ) : (
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  {t("eod.smartEODTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("eod.smartEODDesc")}
                </p>
              </CardHeader>
              <Separator
                className="mx-5"
                style={{ width: "calc(100% - 40px)" }}
              />
              <CardContent className="px-5 pt-4 pb-5 space-y-5">
                {preview.isLoading ? (
                  <div className="space-y-3">
                    {[3, 2, 1].map((w) => (
                      <div
                        key={w}
                        className={`h-4 bg-muted rounded animate-pulse`}
                        style={{ width: `${w * 25}%` }}
                      />
                    ))}
                  </div>
                ) : preview.error ? (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {t("eod.failedLoadPreview")}
                  </div>
                ) : preview.data ? (
                  <>
                    {/* Last report pill */}
                    {preview.data.hasLastReport ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-muted-foreground">
                          {t("eod.lastReport")}{" "}
                          <span className="font-medium text-foreground">
                            {preview.data.lastReportNumber}
                          </span>
                          {preview.data.lastReportDate && (
                            <span className="ml-1">
                              — ended {fmtDate(preview.data.lastReportDate)}
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {t("eod.noPreviousReports")}
                      </div>
                    )}

                    {/* Pending stats */}
                    {preview.data.canGenerate ? (
                      <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          New report will cover
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-3xl font-bold text-primary">
                              {preview.data.pendingOrdersCount}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("orders")}
                            </p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <SaudiRiyalSymbol className="h-5 w-5 opacity-70" />
                              {fmt(preview.data.pendingRevenue)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("revenue")}
                            </p>
                          </div>
                        </div>
                        {preview.data.periodStart && preview.data.periodEnd && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-primary/10">
                            <Clock className="h-3 w-3" />
                            {fmtDate(preview.data.periodStart)} →{" "}
                            {fmtDate(preview.data.periodEnd)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-amber-500/8 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-700 dark:text-amber-400">
                          {t("eod.noNewOrders")}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerate}
                        disabled={
                          !preview.data.canGenerate || generate.isPending
                        }
                        className="flex-1 h-10"
                      >
                        {generate.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {t("eod.generatingBtn")}
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {t("eod.generateBtn")}
                          </>
                        )}
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => preview.refetch()}
                        disabled={preview.isFetching}
                      >
                        <RefreshCw
                          className={cn(
                            "h-4 w-4",
                            preview.isFetching && "animate-spin",
                          )}
                        />
                      </Button> */}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── History tab ── */}
      {view === "history" && (
        <div className="space-y-4">
          {selectedReport ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReport(null)}
                className="gap-1.5 -ml-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t("backToHistory")}
              </Button>
              <ReportView report={selectedReport} />
            </>
          ) : (
            <>
              {history.isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[68px] rounded-xl bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : history.error ? (
                <div className="flex items-center gap-2 text-destructive text-sm p-4 bg-destructive/5 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  {t("failedLoadHistory")}
                </div>
              ) : (history.data?.reports?.length ?? 0) === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                    <FileText className="h-8 w-8 opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("eod.noReportsYet")}
                    </p>
                    <p className="text-xs mt-1">{t("eod.generateFirstHint")}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.data!.reports.map((report) => (
                    <HistoryRow
                      key={report.id}
                      report={report}
                      onSelect={() => setSelectedReport(report)}
                      onDelete={() => handleDelete(report.id)}
                    />
                  ))}
                  {(history.data?.totalPages ?? 1) > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage((p) => p - 1)}
                      >
                        {t("previous")}
                      </Button>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {historyPage} / {history.data?.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          historyPage >= (history.data?.totalPages ?? 1)
                        }
                        onClick={() => setHistoryPage((p) => p + 1)}
                      >
                        {t("next")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

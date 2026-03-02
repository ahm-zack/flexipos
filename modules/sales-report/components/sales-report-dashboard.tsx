"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import {
  useSalesReportPreview,
  useGenerateSalesReport,
  useSalesReportHistory,
  useDeleteSalesReport,
} from "../hooks/use-sales-reports";
import type {
  SavedSalesReport,
  SalesReportData,
  TopItem,
  CategoryBreakdownItem,
  DailySalesItem,
  PaymentBreakdownItem,
} from "@/lib/reports/types";
import { SalesReportPrintView } from "./sales-report-print";
import {
  FileText,
  TrendingUp,
  ShoppingCart,
  Banknote,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ChevronRight,
  CalendarRange,
  Printer,
  BarChart3,
  Save,
  Package,
  ArrowLeft,
  XCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vatUtils } from "@/lib/vat-config";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtShortDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ─── Stat card ────────────────────────────────────────────────────────────────
type CardColor = "blue" | "green" | "orange" | "purple" | "red" | "teal";

const COLOR_MAP: Record<CardColor, { icon: string; value: string; bg: string; border: string }> = {
  blue:   { icon: "text-blue-500",    value: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-500/10",    border: "border-blue-200 dark:border-blue-800" },
  green:  { icon: "text-emerald-500", value: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-800" },
  orange: { icon: "text-orange-500",  value: "text-orange-700 dark:text-orange-300",  bg: "bg-orange-500/10",  border: "border-orange-200 dark:border-orange-800" },
  purple: { icon: "text-violet-500",  value: "text-violet-700 dark:text-violet-300",  bg: "bg-violet-500/10",  border: "border-violet-200 dark:border-violet-800" },
  red:    { icon: "text-rose-500",    value: "text-rose-700 dark:text-rose-300",    bg: "bg-rose-500/10",    border: "border-rose-200 dark:border-rose-800" },
  teal:   { icon: "text-teal-500",    value: "text-teal-700 dark:text-teal-300",    bg: "bg-teal-500/10",    border: "border-teal-200 dark:border-teal-800" },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  currency = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: CardColor;
  currency?: boolean;
}) {
  const c = COLOR_MAP[color];
  return (
    <div className={cn("rounded-xl border p-4 bg-background space-y-3 shadow-sm", c.border)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
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
    </div>
  );
}

// ─── Payment colors ───────────────────────────────────────────────────────────
const PAY_COLORS: Record<string, { bar: string; icon: string; bg: string }> = {
  cash:     { bar: "bg-emerald-500", icon: "text-emerald-500", bg: "bg-emerald-500/10" },
  card:     { bar: "bg-blue-500",    icon: "text-blue-500",    bg: "bg-blue-500/10" },
  delivery: { bar: "bg-orange-500",  icon: "text-orange-500",  bg: "bg-orange-500/10" },
};
const PAY_ICONS: Record<string, React.ElementType> = { cash: Banknote, card: CreditCard, delivery: Truck };

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
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

// ─── Report content ───────────────────────────────────────────────────────────
function ReportContent({
  data,
  title,
  periodStart,
  periodEnd,
}: {
  data: SalesReportData | SavedSalesReport;
  title?: string;
  periodStart: string | Date;
  periodEnd: string | Date;
}) {
  // Normalize camelCase (live preview) vs snake_case (saved)
  const totalRevenue =
    typeof (data as SalesReportData).totalRevenue === "number"
      ? (data as SalesReportData).totalRevenue
      : parseFloat((data as SavedSalesReport).total_revenue ?? "0");
  const _totalOrders =
    (data as SalesReportData).totalOrders ?? (data as SavedSalesReport).total_orders ?? 0;
  const completedOrders =
    (data as SalesReportData).completedOrders ?? (data as SavedSalesReport).completed_orders ?? 0;
  const cancelledOrders =
    (data as SalesReportData).cancelledOrders ?? (data as SavedSalesReport).cancelled_orders ?? 0;
  const averageOrderValue =
    typeof (data as SalesReportData).averageOrderValue === "number"
      ? (data as SalesReportData).averageOrderValue
      : parseFloat((data as SavedSalesReport).average_order_value ?? "0");
  const cashRevenue =
    typeof (data as SalesReportData).cashRevenue === "number"
      ? (data as SalesReportData).cashRevenue
      : parseFloat((data as SavedSalesReport).cash_revenue ?? "0");
  const cardRevenue =
    typeof (data as SalesReportData).cardRevenue === "number"
      ? (data as SalesReportData).cardRevenue
      : parseFloat((data as SavedSalesReport).card_revenue ?? "0");
  const deliveryRevenue =
    typeof (data as SalesReportData).deliveryRevenue === "number"
      ? (data as SalesReportData).deliveryRevenue
      : parseFloat((data as SavedSalesReport).delivery_revenue ?? "0");
  const totalVat =
    typeof (data as SalesReportData).totalVat === "number"
      ? (data as SalesReportData).totalVat
      : parseFloat((data as SavedSalesReport).total_vat ?? "0");
  const revenueExVat =
    typeof (data as SalesReportData).revenueExVat === "number"
      ? (data as SalesReportData).revenueExVat
      : parseFloat((data as SavedSalesReport).revenue_ex_vat ?? "0");

  const topItems = (Array.isArray((data as SalesReportData).topItems)
    ? (data as SalesReportData).topItems
    : (((data as SavedSalesReport).top_items as TopItem[]) ?? [])).slice(0, 15);

  const catBreakdown = Array.isArray((data as SalesReportData).categoryBreakdown)
    ? (data as SalesReportData).categoryBreakdown
    : (((data as SavedSalesReport).category_breakdown as CategoryBreakdownItem[]) ?? []);

  const dailySales = Array.isArray((data as SalesReportData).dailySales)
    ? (data as SalesReportData).dailySales
    : (((data as SavedSalesReport).daily_sales as DailySalesItem[]) ?? []);

  const payBreakdown = Array.isArray((data as SalesReportData).paymentBreakdown)
    ? (data as SalesReportData).paymentBreakdown
    : (((data as SavedSalesReport).payment_breakdown as PaymentBreakdownItem[]) ?? []);

  const maxDayRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          {title && <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">Sales Report</p>}
          <h2 className="text-xl font-bold">{title ?? "Sales Report"}</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5" />
            {fmtShortDate(periodStart)}
            <span className="text-border mx-0.5">→</span>
            {fmtShortDate(periodEnd)}
          </p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1.5 px-3 py-1.5 text-xs font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {completedOrders} completed orders
        </Badge>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={totalRevenue}       icon={TrendingUp}  color="green"  currency />
        <StatCard label="Orders"        value={completedOrders}     icon={ShoppingCart} color="blue" />
        <StatCard label="Avg. Order"    value={averageOrderValue}   icon={BarChart3}   color="purple" currency />
        <StatCard label="Cancelled"     value={cancelledOrders}     icon={XCircle}     color="red" />
      </div>

      {/* Revenue split */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Cash"     value={cashRevenue}     icon={Banknote}  color="green"  currency />
        <StatCard label="Card"     value={cardRevenue}     icon={CreditCard} color="blue"  currency />
        <StatCard label="Delivery" value={deliveryRevenue} icon={Truck}     color="orange" currency />
      </div>

      {/* VAT */}
      {vatUtils.shouldShowVAT() && (
        <Section title="VAT Breakdown (15%)">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Revenue incl. VAT", value: totalRevenue },
              { label: "VAT Amount",        value: totalVat },
              { label: "Revenue excl. VAT", value: revenueExVat },
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
      {payBreakdown.length > 0 && (
        <Section title="Payment Methods" icon={CreditCard}>
          <div className="space-y-4">
            {payBreakdown.map((p) => {
              const Icon = PAY_ICONS[p.method] ?? Banknote;
              const pc   = PAY_COLORS[p.method] ?? PAY_COLORS.cash;
              return (
                <div key={p.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-md", pc.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", pc.icon)} />
                      </div>
                      <span className="capitalize font-medium">{p.method}</span>
                      <span className="text-muted-foreground text-xs">({p.orderCount} orders)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{p.percentage.toFixed(1)}%</span>
                      <span className="font-semibold flex items-center gap-0.5">
                        <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
                        {fmt(p.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", pc.bar)}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Daily sales chart */}
      {dailySales.length > 0 && (
        <Section title="Daily Sales" icon={CalendarRange}>
          <div className="flex items-end gap-px h-28">
            {dailySales.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                <div
                  className={cn(
                    "w-full rounded-sm transition-colors cursor-default",
                    d.orderCount > 0 ? "bg-primary/25 hover:bg-primary/50" : "bg-muted/40",
                  )}
                  style={{ height: `${Math.max(3, (d.revenue / maxDayRevenue) * 100)}%`, minHeight: "3px" }}
                />
                {d.orderCount > 0 && (
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-popover border rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md pointer-events-none">
                    <span className="font-medium">{d.date}</span>
                    <span className="text-muted-foreground ml-2">{d.orderCount} orders</span>
                    <div className="flex items-center gap-0.5 text-primary font-semibold mt-0.5">
                      <SaudiRiyalSymbol className="h-2.5 w-2.5" />{fmt(d.revenue)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {dailySales.length <= 31 && (
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-px">
              <span>{dailySales[0]?.date}</span>
              <span>{dailySales[dailySales.length - 1]?.date}</span>
            </div>
          )}
        </Section>
      )}

      {/* Top items */}
      {topItems.length > 0 && (
        <Section title="Top Selling Items" icon={Package}>
          <div className="space-y-2">
            {topItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                  i === 0 ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" :
                  i === 1 ? "bg-slate-500/15 text-slate-600 dark:text-slate-400" :
                  i === 2 ? "bg-orange-500/15 text-orange-700 dark:text-orange-400" :
                  "bg-muted text-muted-foreground"
                )}>{i + 1}</span>
                <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                {item.categoryName && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0 shrink-0">{item.categoryName}</Badge>
                )}
                <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
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
      {catBreakdown.length > 0 && (
        <Section title="Category Breakdown" icon={BarChart3}>
          <div className="space-y-2">
            {catBreakdown.map((cat, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">{cat.categoryName}</span>
                <span className="text-sm font-semibold flex items-center gap-0.5">
                  <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
                  {fmt(cat.revenue)}
                </span>
              </div>
            ))}
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
  report: SavedSalesReport;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-background hover:border-border hover:shadow-sm transition-all duration-150 cursor-pointer"
      onClick={onSelect}
    >
      <div className="p-2.5 bg-violet-500/10 rounded-xl shrink-0">
        <FileText className="h-4 w-4 text-violet-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{report.report_name ?? "Sales Report"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fmtShortDate(report.period_start)} → {fmtShortDate(report.period_end)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold flex items-center gap-0.5 justify-end">
          <SaudiRiyalSymbol className="h-3 w-3 opacity-60" />
          {fmt(report.total_revenue)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{report.completed_orders} orders</p>
      </div>
      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onSelect}>
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

// ─── Date range picker ────────────────────────────────────────────────────────
function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onStartChange: (d: Date | null) => void;
  onEndChange: (d: Date | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Start Date", date: startDate, onChange: onStartChange, disableFn: (d: Date) => (endDate ? d > endDate : false) },
        { label: "End Date",   date: endDate,   onChange: onEndChange,   disableFn: (d: Date) => (startDate ? d < startDate : false) },
      ].map(({ label, date, onChange, disableFn }) => (
        <div key={label} className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal h-9", !date && "text-muted-foreground")}
              >
                <CalendarRange className="mr-2 h-3.5 w-3.5 shrink-0" />
                {date ? format(date, "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date ?? undefined}
                onSelect={(d) => onChange(d ?? null)}
                disabled={disableFn}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function SalesReportDashboard() {
  const [view, setView] = useState<"generate" | "history">("generate");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const d = new Date(); d.setHours(23, 59, 59, 999); return d;
  });
  const [reportName, setReportName] = useState("");
  const [selectedReport, setSelectedReport] = useState<SavedSalesReport | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const normalizedStart = startDate
    ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
    : null;
  const normalizedEnd = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
    : null;

  const previewEnabled = !!normalizedStart && !!normalizedEnd;
  const preview      = useSalesReportPreview(normalizedStart, normalizedEnd, previewEnabled);
  const generate     = useGenerateSalesReport();
  const history      = useSalesReportHistory(historyPage);
  const deleteReport = useDeleteSalesReport();

  const handleGenerate = () => {
    if (!normalizedStart || !normalizedEnd) {
      toast.error("Please select a start and end date first");
      return;
    }
    generate.mutate(
      { startDate: normalizedStart, endDate: normalizedEnd, reportName: reportName || undefined },
      {
        onSuccess: (saved) => {
          toast.success("Sales report saved");
          setSelectedReport(saved);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to generate report"),
      },
    );
  };

  const handlePrint = () => window.print();

  const handleDelete = (reportId: string) => {
    if (!confirm("Delete this sales report? This cannot be undone.")) return;
    deleteReport.mutate(reportId, {
      onSuccess: () => {
        toast.success("Report deleted");
        if (selectedReport?.id === reportId) setSelectedReport(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete"),
    });
  };

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-5">
      {/* Print overlay */}
      {isPrinting && selectedReport && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto p-8">
          <div className="max-w-[210mm] mx-auto" ref={printRef}>
            <SalesReportPrintView report={selectedReport} />
          </div>
          <div className="fixed top-4 right-4 flex gap-2 print:hidden">
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPrinting(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Tab strip */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {(["generate", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setView(tab); setSelectedReport(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              view === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "generate" ? <Zap className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {tab === "generate" ? "Generate" : "Saved Reports"}
          </button>
        ))}
      </div>

      {/* ── Generate tab ── */}
      {view === "generate" && (
        <div className="space-y-5">
          {selectedReport ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)} className="gap-1.5 -ml-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPrinting(true)} className="gap-1.5">
                  <Printer className="h-4 w-4" /> Print / Export PDF
                </Button>
              </div>
              <ReportContent
                data={selectedReport}
                title={selectedReport.report_name ?? undefined}
                periodStart={selectedReport.period_start}
                periodEnd={selectedReport.period_end}
              />
            </>
          ) : (
            <div className="space-y-5">
              {/* Configuration card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2 pt-5 px-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <CalendarRange className="h-4 w-4 text-primary" />
                    </div>
                    Report Period
                  </CardTitle>
                </CardHeader>
                <Separator className="mx-5" style={{ width: "calc(100% - 40px)" }} />
                <CardContent className="px-5 pt-4 pb-5 space-y-4">
                  {/* Quick presets */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Quick select</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: "Today",     days: 1  },
                        { label: "7 days",    days: 7  },
                        { label: "30 days",   days: 30 },
                        { label: "90 days",   days: 90 },
                      ].map(({ label, days }) => (
                        <button
                          key={days}
                          onClick={() => setPreset(days)}
                          className="px-3 py-1 rounded-full text-xs font-medium border bg-background hover:bg-muted hover:border-border transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartChange={setStartDate}
                    onEndChange={setEndDate}
                  />

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Report Name (optional)</Label>
                    <Input
                      placeholder="e.g. July 2025 Sales Report"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Live preview */}
              {previewEnabled && (
                <div className="space-y-4">
                  {preview.isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
                      ))}
                    </div>
                  ) : preview.error ? (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 rounded-xl p-4">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Failed to load live preview data
                    </div>
                  ) : preview.data ? (
                    <>
                      {/* Live indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          Live preview
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {preview.data.completedOrders} orders
                        </Badge>
                      </div>

                      <ReportContent
                        data={preview.data}
                        periodStart={normalizedStart!}
                        periodEnd={normalizedEnd!}
                      />

                      <Button
                        className="w-full h-10"
                        onClick={handleGenerate}
                        disabled={generate.isPending}
                      >
                        {generate.isPending ? (
                          <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving report…</>
                        ) : (
                          <><Save className="h-4 w-4 mr-2" />Save Report</>
                        )}
                      </Button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── History tab ── */}
      {view === "history" && (
        <div className="space-y-4">
          {selectedReport ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)} className="gap-1.5 -ml-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to History
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPrinting(true)} className="gap-1.5">
                  <Printer className="h-4 w-4" /> Print / Export PDF
                </Button>
              </div>
              <ReportContent
                data={selectedReport}
                title={selectedReport.report_name ?? undefined}
                periodStart={selectedReport.period_start}
                periodEnd={selectedReport.period_end}
              />
            </>
          ) : (
            <>
              {history.isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[68px] rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : history.error ? (
                <div className="flex items-center gap-2 text-destructive text-sm p-4 bg-destructive/5 rounded-xl">
                  <AlertCircle className="h-4 w-4" />Failed to load report history
                </div>
              ) : (history.data?.reports?.length ?? 0) === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                    <FileText className="h-8 w-8 opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No saved reports yet</p>
                    <p className="text-xs mt-1">Generate a report from the Generate tab and save it</p>
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
                      <Button variant="outline" size="sm" disabled={historyPage === 1} onClick={() => setHistoryPage((p) => p - 1)}>
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {historyPage} / {history.data?.totalPages}
                      </span>
                      <Button variant="outline" size="sm" disabled={historyPage >= (history.data?.totalPages ?? 1)} onClick={() => setHistoryPage((p) => p + 1)}>
                        Next
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

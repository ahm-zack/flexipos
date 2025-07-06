"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  CreditCard,
  Banknote,
  Download,
  Trash2,
} from "lucide-react";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import {
  useEODReportHistory,
  useEODReportFormatters,
  useDeleteEODReport,
} from "../hooks";
import { format } from "date-fns";

export function HistoricalEODReports() {
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Simple history request - get all reports
  const historyRequest = {
    page: 1,
    limit: 50,
  };

  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useEODReportHistory(historyRequest);
  const formatters = useEODReportFormatters();
  const deleteReport = useDeleteEODReport();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 px-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-muted-foreground">Loading reports...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">Failed to load reports</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reports = reportData?.reports || [];

  const safeParseNumber = (
    value: string | number | null | undefined
  ): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  };

  const safeGetString = (value: unknown): string => {
    if (typeof value === "string") return value;
    return String(value || "");
  };

  const safeParseJSON = (value: unknown): unknown[] => {
    try {
      if (typeof value === "string") {
        return JSON.parse(value) || [];
      }
      if (Array.isArray(value)) return value;
      return [];
    } catch {
      return [];
    }
  };

  const safeGetDate = (value: unknown): Date => {
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    return new Date();
  };

  // Export functionality for individual reports
  const exportReportToCSV = (report: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportData = report as any; // Type assertion for flexibility with dynamic data
    const bestSellingItems = safeParseJSON(reportData.bestSellingItems);

    const csvData = [
      ["EOD Report Data"],
      ["Report ID", safeGetString(reportData.id)],
      [
        "Generated At",
        format(
          safeGetDate(reportData.generatedAt || reportData.createdAt),
          "dd/MM/yyyy HH:mm"
        ),
      ],
      [
        "Report Date",
        format(
          safeGetDate(reportData.reportDate || reportData.createdAt),
          "dd/MM/yyyy"
        ),
      ],
      ["Report Type", reportData.reportType || "daily"],
      [""],
      ["Financial Summary"],
      ["Total Revenue (with VAT)", safeParseNumber(reportData.totalWithVat)],
      [
        "Total Revenue (without VAT)",
        safeParseNumber(reportData.totalWithoutVat),
      ],
      ["VAT Amount", safeParseNumber(reportData.vatAmount)],
      ["Average Order Value", safeParseNumber(reportData.averageOrderValue)],
      [""],
      ["Order Statistics"],
      ["Total Orders", safeParseNumber(reportData.totalOrders)],
      ["Completed Orders", safeParseNumber(reportData.completedOrders)],
      ["Cancelled Orders", safeParseNumber(reportData.cancelledOrders)],
      [
        "Completion Rate",
        `${safeParseNumber(reportData.orderCompletionRate)}%`,
      ],
      ["Peak Hour", safeGetString(reportData.peakHour) || "N/A"],
      [""],
      ["Payment Breakdown"],
      ["Cash Orders", safeParseNumber(reportData.totalCashOrders)],
      ["Card Orders", safeParseNumber(reportData.totalCardOrders)],
      [""],
      ["Best Selling Items"],
      ...bestSellingItems.map((item: unknown) => {
        const itemData = item as {
          itemName?: string;
          itemType?: string;
          quantity?: number;
          totalRevenue?: number;
        };
        return [
          itemData.itemName || "Unknown",
          `${itemData.quantity || 0} sold - ${itemData.totalRevenue || 0}`,
        ];
      }),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EOD_Report_${safeGetString(reportData.id).slice(-8)}_${format(
      safeGetDate(reportData.reportDate || reportData.createdAt),
      "yyyy-MM-dd"
    )}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete functionality for individual reports
  const handleDeleteReport = (reportId: string) => {
    setDeletingReportId(reportId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReport = async () => {
    if (!deletingReportId) return;

    try {
      await deleteReport.mutateAsync(deletingReportId);

      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setDeletingReportId(null);

      // The hook automatically invalidates the cache and refetches
      console.log("Report deleted successfully");
    } catch (error) {
      console.error("Failed to delete report:", error);
      // You might want to show an error toast here
      // For now, keep the dialog open so user can try again
    }
  };

  const cancelDeleteReport = () => {
    setDeleteDialogOpen(false);
    setDeletingReportId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-bold">📊 Historical EOD Reports</h1>
        <p className="text-muted-foreground">
          View previous End of Day reports ({reports.length} total reports
          available)
        </p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reports found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const bestSellingItems = safeParseJSON(report.bestSellingItems);

            return (
              <Card
                key={safeGetString(report.id)}
                className="w-full hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
              >
                <CardContent className="p-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Report #{safeGetString(report.id).slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            safeGetDate(report.reportDate || report.createdAt),
                            "dd/MM/yyyy"
                          )}{" "}
                          • {report.reportType || "daily"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary flex items-center gap-1">
                        <SaudiRiyalSymbol size={20} className="text-primary" />
                        {formatters.formatCurrency(
                          safeParseNumber(report.totalWithVat)
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {safeParseNumber(report.totalOrders)} orders
                      </p>
                    </div>
                  </div>

                  {/* Main Stats Grid - Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                        {safeParseNumber(report.completedOrders)}
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                        {safeParseNumber(report.cancelledOrders)}
                      </div>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatters.formatPercentage(
                          safeParseNumber(report.orderCompletionRate)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                        <SaudiRiyalSymbol
                          size={14}
                          className="text-purple-600 dark:text-purple-400"
                        />
                        {formatters.formatCurrency(
                          safeParseNumber(report.averageOrderValue)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Avg Order</p>
                    </div>
                    <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatters.formatPeakHour(
                          safeGetString(report.peakHour)
                        ) || "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground">Peak</p>
                    </div>
                    <div className="text-center p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
                      <div className="text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1">
                        <SaudiRiyalSymbol
                          size={14}
                          className="text-teal-600 dark:text-teal-400"
                        />
                        {formatters.formatCurrency(
                          safeParseNumber(report.vatAmount)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">VAT</p>
                    </div>
                  </div>

                  {/* Payment & Sales Row - Responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Breakdown */}
                    <div className="bg-muted/50 p-3 rounded-lg border">
                      <h4 className="font-medium text-sm mb-2">
                        Payment Split
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Banknote className="h-3 w-3 text-green-600 dark:text-green-400" />
                            Cash
                          </span>
                          <span className="font-medium flex items-center gap-1">
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-green-600 dark:text-green-400"
                            />
                            {formatters.formatCurrency(
                              safeParseNumber(report.totalCashOrders)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            Card
                          </span>
                          <span className="font-medium flex items-center gap-1">
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-blue-600 dark:text-blue-400"
                            />
                            {formatters.formatCurrency(
                              safeParseNumber(report.totalCardOrders)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top Items */}
                    <div className="bg-muted/50 p-3 rounded-lg border">
                      <h4 className="font-medium text-sm mb-2">Top Items</h4>
                      <div className="space-y-1">
                        {bestSellingItems.length > 0 ? (
                          bestSellingItems
                            .slice(0, 2)
                            .map((item: unknown, index: number) => {
                              const itemData = item as {
                                itemName?: string;
                                itemType?: string;
                                quantity?: number;
                                totalRevenue?: number;
                              };
                              return (
                                <div
                                  key={index}
                                  className="flex justify-between text-xs"
                                >
                                  <span className="truncate">
                                    {itemData.itemName || "Unknown"}
                                  </span>
                                  <span className="font-medium ml-2">
                                    {itemData.quantity || 0}x
                                  </span>
                                </div>
                              );
                            })
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No item data
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <div className="text-xs text-muted-foreground">
                        Generated:{" "}
                        {format(
                          safeGetDate(report.generatedAt || report.createdAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        Net:
                        <SaudiRiyalSymbol
                          size={10}
                          className="text-muted-foreground"
                        />
                        {formatters.formatCurrency(
                          safeParseNumber(report.totalWithoutVat)
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportReportToCSV(report)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDeleteReport(safeGetString(report.id))
                        }
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      {reports.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h2 className="text-lg font-semibold mb-3">📈 Summary Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                <SaudiRiyalSymbol
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
                {formatters.formatCurrency(
                  reports.reduce(
                    (sum, report) => sum + safeParseNumber(report.totalWithVat),
                    0
                  )
                )}
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Total Revenue ({reports.length} reports)
              </p>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reports.reduce(
                  (sum, report) => sum + safeParseNumber(report.totalOrders),
                  0
                )}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Total Orders (Avg:{" "}
                {Math.round(
                  reports.reduce(
                    (sum, report) => sum + safeParseNumber(report.totalOrders),
                    0
                  ) / reports.length
                )}
                )
              </p>
            </div>

            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatters.formatPercentage(
                  reports.reduce(
                    (sum, report) =>
                      sum + safeParseNumber(report.orderCompletionRate),
                    0
                  ) / reports.length
                )}
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Avg Completion Rate
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete EOD Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this EOD report? This action
              cannot be undone.
              {deletingReportId && (
                <span className="block mt-2 text-sm font-medium">
                  Report ID: #{deletingReportId.slice(-8)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDeleteReport}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteReport}
              disabled={deleteReport.isPending}
              className="text-sm"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {deleteReport.isPending ? "Deleting..." : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

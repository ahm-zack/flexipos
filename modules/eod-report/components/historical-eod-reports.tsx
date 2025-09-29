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
  Truck,
} from "lucide-react";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import {
  useEODReportHistory,
  useEODReportFormatters,
  useDeleteEODReport,
} from "../hooks";
import { format } from "date-fns";
import {
  generateEODReportPDF,
  convertHistoricalReportData,
  safeGetString,
  safeParseNumber,
  safeParseJSON,
} from "@/lib/eod-pdf-generator";
import { vatUtils } from "@/lib/vat-config";

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
      [
        "Report Number",
        safeGetString(reportData.reportNumber) ||
          `Report #${safeGetString(reportData.id).slice(-8)}`,
      ],
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
      ["Total Revenue", safeParseNumber(reportData.totalWithVat)],
      // VAT details temporarily hidden - can be re-enabled later
      ...(vatUtils.shouldShowVAT()
        ? [
            [
              "Total Revenue (without VAT)",
              safeParseNumber(reportData.totalWithoutVat),
            ],
            ["VAT Amount", safeParseNumber(reportData.vatAmount)],
          ]
        : []),
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
      ["Delivery Platform Breakdown"],
      ...(() => {
        const deliveryPlatforms = safeParseJSON(
          reportData.deliveryPlatformBreakdown || "[]"
        ) as { platform: string; orderCount: number; totalAmount: number }[];
        return deliveryPlatforms.map((platform) => {
          const formatPlatformName = (name: string): string => {
            switch (name) {
              case "keeta":
                return "Keeta";
              case "hunger_station":
                return "Hunger Station";
              case "jahez":
                return "Jahez";
              default:
                return name;
            }
          };
          return [
            formatPlatformName(platform.platform),
            `${platform.orderCount} orders`,
            safeParseNumber(platform.totalAmount),
          ];
        });
      })(),
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
    const reportNumber =
      safeGetString(reportData.reportNumber) ||
      `Report_${safeGetString(reportData.id).slice(-8)}`;
    a.download = `${reportNumber}_${format(
      safeGetDate(reportData.reportDate || reportData.createdAt),
      "yyyy-MM-dd"
    )}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF download functionality for historical reports
  const downloadReportPDF = async (
    reportData: Record<string, unknown>,
    format: "a4" | "thermal"
  ) => {
    try {
      // Convert historical report data to standard format
      const convertedData = convertHistoricalReportData(reportData);

      // Generate PDF using the reusable utility
      await generateEODReportPDF(convertedData, format, formatters);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
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
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold">
          📊 Historical EOD Reports
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
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
        <div className="space-y-3 px-1 sm:px-0">
          {reports.map((report) => {
            const bestSellingItems = safeParseJSON(report.bestSellingItems);

            return (
              <Card
                key={safeGetString(report.id)}
                className="w-full mx-auto hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                        <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {safeGetString(report.reportNumber) ||
                            `Report #${safeGetString(report.id).slice(-8)}`}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(
                            safeGetDate(report.reportDate || report.createdAt),
                            "dd/MM/yyyy"
                          )}{" "}
                          • {report.reportType || "daily"}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-1">
                        <SaudiRiyalSymbol
                          size={16}
                          className="text-primary sm:hidden"
                        />
                        <SaudiRiyalSymbol
                          size={20}
                          className="text-primary hidden sm:block"
                        />
                        <span className="truncate">
                          {formatters.formatCurrency(
                            safeParseNumber(report.totalWithVat)
                          )}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {safeParseNumber(report.totalOrders)} orders
                      </p>
                    </div>
                  </div>

                  {/* Main Stats Grid - Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="text-center p-2 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600 dark:text-green-400">
                        {safeParseNumber(report.completedOrders)}
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600 dark:text-red-400">
                        {safeParseNumber(report.cancelledOrders)}
                      </div>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatters.formatPercentage(
                          safeParseNumber(report.orderCompletionRate)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                        <SaudiRiyalSymbol
                          size={12}
                          className="text-purple-600 dark:text-purple-400 sm:hidden"
                        />
                        <SaudiRiyalSymbol
                          size={14}
                          className="text-purple-600 dark:text-purple-400 hidden sm:block"
                        />
                        <span className="truncate text-xs sm:text-sm lg:text-base">
                          {formatters.formatCurrency(
                            safeParseNumber(report.averageOrderValue)
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Avg Order</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatters.formatPeakHour(
                          safeGetString(report.peakHour)
                        ) || "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground">Peak</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1">
                        <SaudiRiyalSymbol
                          size={12}
                          className="text-teal-600 dark:text-teal-400 sm:hidden"
                        />
                        <SaudiRiyalSymbol
                          size={14}
                          className="text-teal-600 dark:text-teal-400 hidden sm:block"
                        />
                        <span className="truncate text-xs sm:text-sm lg:text-base">
                          {formatters.formatCurrency(
                            safeParseNumber(report.vatAmount)
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">VAT</p>
                    </div>
                  </div>

                  {/* Payment & Sales Row - Responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Payment Breakdown */}
                    <div className="bg-muted/50 p-2 sm:p-3 rounded-lg border">
                      <h4 className="font-medium text-xs sm:text-sm mb-2">
                        Payment Split
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Banknote className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="truncate">Cash</span>
                          </span>
                          <span className="font-medium flex items-center gap-1 flex-shrink-0">
                            <SaudiRiyalSymbol
                              size={10}
                              className="text-green-600 dark:text-green-400 sm:hidden"
                            />
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-green-600 dark:text-green-400 hidden sm:block"
                            />
                            <span className="truncate">
                              {formatters.formatCurrency(
                                safeParseNumber(report.totalCashOrders)
                              )}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="truncate">Card</span>
                          </span>
                          <span className="font-medium flex items-center gap-1 flex-shrink-0">
                            <SaudiRiyalSymbol
                              size={10}
                              className="text-blue-600 dark:text-blue-400 sm:hidden"
                            />
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-blue-600 dark:text-blue-400 hidden sm:block"
                            />
                            <span className="truncate">
                              {formatters.formatCurrency(
                                safeParseNumber(report.totalCardOrders)
                              )}
                            </span>
                          </span>
                        </div>
                        {/* Delivery Platform Breakdown */}
                        {(() => {
                          const deliveryPlatforms = safeParseJSON(
                            report.deliveryPlatformBreakdown || "[]"
                          ) as {
                            platform: string;
                            orderCount: number;
                            totalAmount: number;
                          }[];
                          const totalDeliveryAmount = deliveryPlatforms.reduce(
                            (sum, platform) =>
                              sum + (platform.totalAmount || 0),
                            0
                          );

                          if (totalDeliveryAmount > 0) {
                            return (
                              <div className="space-y-1 pt-1 border-t border-muted-foreground/20">
                                <div className="flex justify-between text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                  <span className="flex items-center gap-1">
                                    <Truck className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">Delivery</span>
                                  </span>
                                  <span className="flex items-center gap-1 flex-shrink-0">
                                    <SaudiRiyalSymbol
                                      size={10}
                                      className="sm:hidden"
                                    />
                                    <SaudiRiyalSymbol
                                      size={12}
                                      className="hidden sm:block"
                                    />
                                    <span className="truncate">
                                      {formatters.formatCurrency(
                                        totalDeliveryAmount
                                      )}
                                    </span>
                                  </span>
                                </div>
                                {deliveryPlatforms.map((platform, index) => {
                                  const formatPlatformName = (
                                    name: string
                                  ): string => {
                                    switch (name) {
                                      case "keeta":
                                        return "Keeta";
                                      case "hunger_station":
                                        return "Hunger Station";
                                      case "jahez":
                                        return "Jahez";
                                      default:
                                        return name;
                                    }
                                  };

                                  return (
                                    <div
                                      key={index}
                                      className="flex justify-between text-xs text-yellow-600/80 dark:text-yellow-400/80 ml-4"
                                    >
                                      <span className="truncate">
                                        {formatPlatformName(platform.platform)}{" "}
                                        ({platform.orderCount})
                                      </span>
                                      <span className="flex items-center gap-1 flex-shrink-0">
                                        <SaudiRiyalSymbol
                                          size={8}
                                          className="sm:hidden"
                                        />
                                        <SaudiRiyalSymbol
                                          size={10}
                                          className="hidden sm:block"
                                        />
                                        <span className="truncate">
                                          {formatters.formatCurrency(
                                            platform.totalAmount || 0
                                          )}
                                        </span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Top Items */}
                    <div className="bg-muted/50 p-2 sm:p-3 rounded-lg border">
                      <h4 className="font-medium text-xs sm:text-sm mb-2">
                        Top Items
                      </h4>
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
                                  className="flex justify-between text-xs items-center gap-2"
                                >
                                  <span className="truncate flex-1 min-w-0">
                                    {itemData.itemName || "Unknown"}
                                  </span>
                                  <span className="font-medium flex-shrink-0">
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
                  <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
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
                        <span className="truncate">
                          {formatters.formatCurrency(
                            safeParseNumber(report.totalWithoutVat)
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportReportToCSV(report)}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Download </span>CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReportPDF(report, "a4")}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        📄 <span className="hidden sm:inline">A4 </span>PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReportPDF(report, "thermal")}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        🧾 <span className="hidden sm:inline">Print</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDeleteReport(safeGetString(report.id))
                        }
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1 sm:flex-initial"
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
        <div className="mt-6 pt-4 border-t px-1 sm:px-0">
          <h2 className="text-lg font-semibold mb-3">📈 Summary Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-green-500/10 p-3 sm:p-4 rounded-lg border border-green-500/20">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                <SaudiRiyalSymbol
                  size={18}
                  className="text-green-600 dark:text-green-400 sm:hidden"
                />
                <SaudiRiyalSymbol
                  size={20}
                  className="text-green-600 dark:text-green-400 hidden sm:block"
                />
                <span className="truncate">
                  {formatters.formatCurrency(
                    reports.reduce(
                      (sum, report) =>
                        sum + safeParseNumber(report.totalWithVat),
                      0
                    )
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">
                Total Revenue ({reports.length} reports)
              </p>
            </div>

            <div className="bg-blue-500/10 p-3 sm:p-4 rounded-lg border border-blue-500/20">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reports.reduce(
                  (sum, report) => sum + safeParseNumber(report.totalOrders),
                  0
                )}
              </div>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
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

            <div className="bg-purple-500/10 p-3 sm:p-4 rounded-lg border border-purple-500/20">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatters.formatPercentage(
                  reports.reduce(
                    (sum, report) =>
                      sum + safeParseNumber(report.orderCompletionRate),
                    0
                  ) / reports.length
                )}
              </div>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-1">
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

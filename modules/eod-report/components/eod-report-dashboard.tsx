"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import { DateTimePicker } from "@/components/date-time-picker";
import { useGenerateEODReport, useEODReportFormatters } from "../hooks";
import { generateEODReportPDF, safeGetString } from "@/lib/eod-pdf-generator";

// Export the historical reports component
export { HistoricalEODReports } from "./historical-eod-reports";

export function EODReportDashboard() {
  // Calculate default date range: 4 PM today to 12 AM tomorrow (restaurant operating hours)
  const getDefaultDateRange = () => {
    const today = new Date();

    // Start time: 4 PM today
    const startDateTime = new Date(today);
    startDateTime.setHours(16, 0, 0, 0); // 4:00 PM

    // End time: 12 AM tomorrow (midnight)
    const endDateTime = new Date(today);
    endDateTime.setDate(today.getDate() + 1); // Next day
    endDateTime.setHours(0, 0, 0, 0); // 12:00 AM (midnight)

    return { startDateTime, endDateTime };
  };

  const defaultRange = getDefaultDateRange();
  const [startDateTime, setStartDateTime] = useState<Date | undefined>(
    defaultRange.startDateTime
  );
  const [endDateTime, setEndDateTime] = useState<Date | undefined>(
    defaultRange.endDateTime
  );
  const [nextReportNumber, setNextReportNumber] = useState<string | null>(null);

  const generateReport = useGenerateEODReport();
  const formatters = useEODReportFormatters();

  // Fetch next report number when component mounts
  React.useEffect(() => {
    const fetchNextReportNumber = async () => {
      try {
        const response = await fetch("/api/admin/reports/eod/next-number");
        const result = await response.json();
        if (result.success && result.data?.nextReportNumber) {
          setNextReportNumber(result.data.nextReportNumber);
        }
      } catch (error) {
        console.error("Failed to fetch next report number:", error);
      }
    };

    fetchNextReportNumber();
  }, []);

  const handleGenerateReport = () => {
    if (!startDateTime || !endDateTime) {
      alert("Please select both start and end date/time");
      return;
    }

    if (startDateTime >= endDateTime) {
      alert("End date/time must be after start date/time");
      return;
    }

    generateReport.mutate({
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      saveToDatabase: true,
      includePreviousPeriodComparison: false,
    });
  };

  const handleDownloadPDF = async (format: "a4" | "thermal") => {
    if (!reportData) return;

    // Convert the report data to the format expected by the utility
    // Handle both Date objects and string values safely
    const convertedData = {
      ...reportData,
      startDateTime:
        reportData.startDateTime instanceof Date
          ? reportData.startDateTime.toISOString()
          : safeGetString(reportData.startDateTime),
      endDateTime:
        reportData.endDateTime instanceof Date
          ? reportData.endDateTime.toISOString()
          : safeGetString(reportData.endDateTime),
      reportGeneratedAt:
        reportData.reportGeneratedAt instanceof Date
          ? reportData.reportGeneratedAt.toISOString()
          : safeGetString(reportData.reportGeneratedAt),
    };

    // Debug: Log the data being passed to PDF generator
    console.log("Report data before conversion:", reportData);
    console.log("Converted data for PDF:", convertedData);

    await generateEODReportPDF(convertedData, format, formatters);
  };
  const reportData = generateReport.data;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold">EOD Report Generator</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Select date and time range to generate End of Day report
        </p>
      </div>

      <Card className="w-full mx-1 sm:mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg">Select Date & Time Range</CardTitle>
            {nextReportNumber && (
              <Badge variant="secondary" className="text-xs font-mono">
                Next: {nextReportNumber}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Date/Time Range Picker */}
            <DateTimePicker
              fromDate={startDateTime}
              toDate={endDateTime}
              onFromDateChange={setStartDateTime}
              onToDateChange={setEndDateTime}
              onClearDates={() => {
                setStartDateTime(undefined);
                setEndDateTime(undefined);
              }}
              fromDateLabel="Start Date"
              toDateLabel="End Date"
              fromTimeLabel="Start Time"
              toTimeLabel="End Time"
              showRange={true}
              showClearButton={true}
              className=""
            />
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={generateReport.isPending}
            className="w-full sm:w-auto sm:px-8 text-sm"
          >
            {generateReport.isPending ? "Generating..." : "Generate EOD Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Results - Show all EOD Report Details */}
      {generateReport.isSuccess && reportData && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="w-full mx-1 sm:mx-0 border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-lg text-green-600 dark:text-green-400">
                  ✅ Report Generated Successfully
                </span>
                <Badge variant="default" className="text-xs bg-green-600">
                  Saved to Database
                </Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                📅 Period:{" "}
                {formatters.formatDateRange(
                  new Date(reportData.startDateTime),
                  new Date(reportData.endDateTime)
                )}{" "}
                • 🕒 Generated:{" "}
                {formatters.formatDate(new Date(reportData.reportGeneratedAt))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PDF Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleDownloadPDF("a4")}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  📄 Download A4 PDF
                </Button>
                <Button
                  onClick={() => handleDownloadPDF("thermal")}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  🧾 Download Thermal PDF
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                    <SaudiRiyalSymbol
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                    {formatters.formatCurrency(reportData.totalWithVat)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    💰 Total Revenue
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {reportData.totalOrders}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    📋 Total Orders
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatters.formatPercentage(
                      reportData.orderCompletionRate
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    ✅ Completion Rate
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                    <SaudiRiyalSymbol
                      size={20}
                      className="text-orange-600 dark:text-orange-400"
                    />
                    {formatters.formatCurrency(reportData.averageOrderValue)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    📊 Average Order
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full mx-1 sm:mx-0">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm py-2 px-1 sm:px-3"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="text-xs sm:text-sm py-2 px-1 sm:px-3"
              >
                Payments
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="text-xs sm:text-sm py-2 px-1 sm:px-3"
              >
                All Sold Items
              </TabsTrigger>
              <TabsTrigger
                value="hourly"
                className="text-xs sm:text-sm py-2 px-1 sm:px-3"
              >
                Hourly Sales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-6xl mx-auto">
                <Card className="w-full mx-1 sm:mx-0">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      💰 Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Revenue (with VAT):</span>
                      <span className="font-bold text-sm text-green-600 flex items-center gap-1">
                        <SaudiRiyalSymbol
                          size={12}
                          className="text-green-600"
                        />
                        {formatters.formatCurrency(reportData.totalWithVat)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Total Revenue (without VAT):
                      </span>
                      <span className="text-sm flex items-center gap-1">
                        <SaudiRiyalSymbol size={12} className="text-current" />
                        {formatters.formatCurrency(reportData.totalWithoutVat)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">VAT Amount:</span>
                      <span className="text-sm text-blue-600 flex items-center gap-1">
                        <SaudiRiyalSymbol size={12} className="text-blue-600" />
                        {formatters.formatCurrency(reportData.vatAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Order Value:</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <SaudiRiyalSymbol size={12} className="text-current" />
                        {formatters.formatCurrency(
                          reportData.averageOrderValue
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full mx-1 sm:mx-0">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      📊 Order Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Orders:</span>
                      <span className="font-bold text-sm">
                        {reportData.totalOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Orders:</span>
                      <span className="text-green-600 text-sm font-medium">
                        {reportData.completedOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cancelled Orders:</span>
                      <span className="text-red-600 text-sm font-medium">
                        {reportData.totalCancelledOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Hour:</span>
                      <span className="font-bold text-sm">
                        {formatters.formatPeakHour(reportData.peakHour) ||
                          "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card className="w-full mx-1 sm:mx-auto max-w-4xl">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Payment Method Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.paymentBreakdown.map((payment, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between sm:items-center p-3 border rounded gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-semibold capitalize text-sm">
                            {payment.method}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.orderCount} orders
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-bold text-sm flex items-center gap-1">
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-current"
                            />
                            {formatters.formatCurrency(payment.totalAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatters.formatPercentage(payment.percentage)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card className="w-full mx-1 sm:mx-auto max-w-4xl">
                <CardHeader>
                  <CardTitle className="text-lg">All Sold Items</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete list of all items sold during the reporting period
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.bestSellingItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between sm:items-center p-3 border rounded gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {item.itemName}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {item.itemType} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-bold text-sm flex items-center gap-1">
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-current"
                            />
                            {formatters.formatCurrency(item.totalRevenue)}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            Avg:{" "}
                            <SaudiRiyalSymbol
                              size={10}
                              className="text-muted-foreground"
                            />
                            {formatters.formatCurrency(item.averagePrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hourly" className="space-y-4">
              <Card className="w-full mx-1 sm:mx-auto max-w-6xl">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Hourly Sales Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reportData.hourlySales
                      .filter((hour) => hour.orderCount > 0)
                      .map((hour, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="font-semibold text-sm">
                            {hour.hour.toString().padStart(2, "0")}:00
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {hour.orderCount} orders
                          </div>
                          <div className="font-bold text-green-600 text-sm flex items-center gap-1">
                            <SaudiRiyalSymbol
                              size={12}
                              className="text-green-600"
                            />
                            {formatters.formatCurrency(hour.revenue)}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {generateReport.isError && (
        <Card className="w-full mx-1 sm:mx-0">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              {generateReport.error?.message || "Failed to generate report"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

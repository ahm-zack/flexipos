"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateEODReport, useEODReportFormatters } from "../hooks";

// Export the historical reports component
export { HistoricalEODReports } from "./historical-eod-reports";

export function EODReportDashboard() {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const generateReport = useGenerateEODReport();
  const formatters = useEODReportFormatters();

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  };

  const handleGenerateReport = () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      alert("Please fill in all date and time fields");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

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
          <CardTitle className="text-lg">Select Date & Time Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
                placeholder="dd/mm/yyyy"
              />
              {startDate && (
                <p className="text-xs text-muted-foreground">
                  {formatDateForDisplay(startDate)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-medium">
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* End Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
                placeholder="dd/mm/yyyy"
              />
              {endDate && (
                <p className="text-xs text-muted-foreground">
                  {formatDateForDisplay(endDate)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-sm font-medium">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-sm"
              />
            </div>
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
          <Card className="w-full mx-1 sm:mx-0">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-lg">Report Generated Successfully</span>
                <Badge variant="default" className="text-xs">
                  Saved to Database
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatters.formatCurrency(reportData.totalWithVat)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">
                    {reportData.totalOrders}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Total Orders
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {formatters.formatPercentage(
                      reportData.orderCompletionRate
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Completion Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatters.formatCurrency(reportData.averageOrderValue)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Average Order
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
                Best Sellers
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
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Revenue (with VAT):</span>
                      <span className="font-bold text-sm">
                        {formatters.formatCurrency(reportData.totalWithVat)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Total Revenue (without VAT):
                      </span>
                      <span className="text-sm">
                        {formatters.formatCurrency(reportData.totalWithoutVat)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">VAT Amount:</span>
                      <span className="text-sm">
                        {formatters.formatCurrency(reportData.vatAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Order Value:</span>
                      <span className="text-sm">
                        {formatters.formatCurrency(
                          reportData.averageOrderValue
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full mx-1 sm:mx-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Statistics</CardTitle>
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
                      <span className="text-green-600 text-sm">
                        {reportData.completedOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cancelled Orders:</span>
                      <span className="text-red-600 text-sm">
                        {reportData.totalCancelledOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Hour:</span>
                      <span className="font-bold text-sm">
                        {reportData.peakHour || "N/A"}
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
                          <div className="font-bold text-sm">
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
                  <CardTitle className="text-lg">Best Selling Items</CardTitle>
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
                          <div className="font-bold text-sm">
                            {formatters.formatCurrency(item.totalRevenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg: {formatters.formatCurrency(item.averagePrice)}
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
                          <div className="font-bold text-green-600 text-sm">
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

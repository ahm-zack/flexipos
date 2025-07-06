"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateEODReport, useEODReportFormatters } from "../hooks";

export function EODReportDashboard() {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const generateReport = useGenerateEODReport();
  const formatters = useEODReportFormatters();

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">EOD Report Generator</h1>
        <p className="text-muted-foreground">
          Select date and time range to generate End of Day report
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Date & Time Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            {/* End Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={generateReport.isPending}
            className="w-full"
          >
            {generateReport.isPending ? "Generating..." : "Generate EOD Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Results - Show all EOD Report Details */}
      {generateReport.isSuccess && reportData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Report Generated Successfully
                <Badge variant="default">Saved to Database</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatters.formatCurrency(reportData.totalWithVat)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {reportData.totalOrders}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Orders
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatters.formatPercentage(
                      reportData.orderCompletionRate
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completion Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatters.formatCurrency(reportData.averageOrderValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Order
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="products">Best Sellers</TabsTrigger>
              <TabsTrigger value="hourly">Hourly Sales</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Revenue (with VAT):</span>
                      <span className="font-bold">
                        {formatters.formatCurrency(reportData.totalWithVat)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue (without VAT):</span>
                      <span>
                        {formatters.formatCurrency(reportData.totalWithoutVat)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT Amount:</span>
                      <span>
                        {formatters.formatCurrency(reportData.vatAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value:</span>
                      <span>
                        {formatters.formatCurrency(
                          reportData.averageOrderValue
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Orders:</span>
                      <span className="font-bold">
                        {reportData.totalOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Orders:</span>
                      <span className="text-green-600">
                        {reportData.completedOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled Orders:</span>
                      <span className="text-red-600">
                        {reportData.totalCancelledOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Hour:</span>
                      <span className="font-bold">
                        {reportData.peakHour || "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.paymentBreakdown.map((payment, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded"
                      >
                        <div>
                          <div className="font-semibold capitalize">
                            {payment.method}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.orderCount} orders
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatters.formatCurrency(payment.totalAmount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
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
              <Card>
                <CardHeader>
                  <CardTitle>Best Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.bestSellingItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded"
                      >
                        <div>
                          <div className="font-semibold">{item.itemName}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {item.itemType} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatters.formatCurrency(item.totalRevenue)}
                          </div>
                          <div className="text-sm text-muted-foreground">
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
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Sales Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reportData.hourlySales
                      .filter((hour) => hour.orderCount > 0)
                      .map((hour, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="font-semibold">
                            {hour.hour.toString().padStart(2, "0")}:00
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {hour.orderCount} orders
                          </div>
                          <div className="font-bold text-green-600">
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
        <Card>
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

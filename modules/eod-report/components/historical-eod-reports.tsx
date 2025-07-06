"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useEODReportHistory, useEODReportFormatters } from "../hooks";
import { format } from "date-fns";
import type { SavedEODReport, PaymentBreakdown } from "@/lib/schemas";

export function HistoricalEODReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("week");

  // Default history request
  const historyRequest = {
    page: 1,
    limit: 50,
    reportType: undefined,
    startDate: undefined,
    endDate: undefined,
  };

  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useEODReportHistory(historyRequest);
  const formatters = useEODReportFormatters();

  const filteredReports = React.useMemo(() => {
    if (!reportData?.reports) return [];

    const reports = reportData.reports;
    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "all":
        return reports;
      default:
        return reports;
    }

    return reports.filter(
      (report: SavedEODReport) => new Date(report.createdAt) >= filterDate
    );
  }, [reportData, selectedPeriod]);

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, "dd/MM/yyyy HH:mm")} - ${format(
      endDate,
      "dd/MM/yyyy HH:mm"
    )}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-muted-foreground">
            Loading historical reports...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
        <Card className="w-full mx-1 sm:mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">
              Failed to load historical reports
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Historical EOD Reports
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          View and analyze previous End of Day reports
        </p>
      </div>

      {/* Filter Controls */}
      <Card className="w-full mx-1 sm:mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPeriod === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("week")}
            >
              Last 7 Days
            </Button>
            <Button
              variant={selectedPeriod === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("month")}
            >
              Last 30 Days
            </Button>
            <Button
              variant={selectedPeriod === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("all")}
            >
              All Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="w-full mx-1 sm:mx-auto max-w-4xl">
          <CardContent className="text-center py-8">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No reports found for the selected period
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReports.map((report: SavedEODReport) => {
            // Safely parse JSON fields with error handling
            let paymentBreakdown = [];

            try {
              paymentBreakdown =
                typeof report.paymentBreakdown === "string"
                  ? JSON.parse(report.paymentBreakdown)
                  : report.paymentBreakdown || [];
            } catch {
              paymentBreakdown = [];
            }

            return (
              <Card key={report.id} className="w-full mx-1 sm:mx-0">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {formatDateRange(
                          report.startDateTime,
                          report.endDateTime
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generated:{" "}
                        {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <Badge
                      className={getStatusColor("completed")}
                      variant="secondary"
                    >
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-sm">
                          {formatters.formatCurrency(report.totalWithVat)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="font-semibold text-sm">
                          {report.totalOrders}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Avg Order
                        </p>
                        <p className="font-semibold text-sm">
                          {formatters.formatCurrency(report.averageOrderValue)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Peak Hour
                        </p>
                        <p className="font-semibold text-sm">
                          {report.peakHour || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Completion Rate
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatters.formatPercentage(
                          report.orderCompletionRate
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Payment Methods
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {paymentBreakdown.length > 0 ? (
                        paymentBreakdown.map(
                          (payment: PaymentBreakdown, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {payment.method}:{" "}
                              {formatters.formatPercentage(payment.percentage)}
                            </Badge>
                          )
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No payment data
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

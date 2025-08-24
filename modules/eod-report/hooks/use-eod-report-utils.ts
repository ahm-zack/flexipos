import { useMemo } from 'react';
import type { EODReportData } from '@/lib/schemas';

/**
 * Hook to format EOD report data for display
 */
export const useEODReportFormatters = () => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0.00%';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0.00%';
    return `${numValue.toFixed(2)}%`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateRange = (startDate: Date, endDate: Date): string => {
    const start = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(startDate);

    const end = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(endDate);

    return `${start} - ${end}`;
  };

  const formatPeakHour = (peakHour?: string): string => {
    if (!peakHour) return 'N/A';

    const hour = parseInt(peakHour.split(':')[0]);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:00 ${period}`;
  };

  return {
    formatCurrency,
    formatPercentage,
    formatDate,
    formatDateRange,
    formatPeakHour,
  };
};

/**
 * Hook to analyze EOD report data and provide insights
 */
export const useEODReportAnalytics = (reportData?: EODReportData) => {
  const analytics = useMemo(() => {
    if (!reportData) return null;

    // Payment method analysis
    const paymentInsights = {
      dominantPaymentMethod: reportData.paymentBreakdown.length > 0
        ? reportData.paymentBreakdown.reduce((prev, current) =>
          prev.percentage > current.percentage ? prev : current
        ).method
        : 'N/A',

      cashVsCardRatio: reportData.totalCashOrders > 0 && reportData.totalCardOrders > 0
        ? (reportData.totalCashOrders / reportData.totalCardOrders).toFixed(2)
        : 'N/A',
    };

    // Performance insights
    const performanceInsights = {
      isHighPerformance: reportData.orderCompletionRate > 95,
      cancellationTrend: reportData.orderCancellationRate > 10 ? 'high' :
        reportData.orderCancellationRate > 5 ? 'moderate' : 'low',
      averageOrderTrend: reportData.averageOrderValue > 50 ? 'high' :
        reportData.averageOrderValue > 30 ? 'moderate' : 'low',
    };

    // Sales pattern analysis
    const salesPattern = {
      busiestHour: reportData.peakHour,
      totalHoursActive: reportData.hourlySales.filter(h => h.orderCount > 0).length,
      averageOrdersPerHour: reportData.totalOrders > 0
        ? (reportData.totalOrders / 24).toFixed(1)
        : '0',
    };

    // Best sellers analysis
    const bestSellersInsights = {
      topItem: reportData.bestSellingItems.length > 0
        ? reportData.bestSellingItems[0]
        : null,
      totalItemsSold: reportData.bestSellingItems.reduce((sum, item) => sum + item.quantity, 0),
      averageItemPrice: reportData.bestSellingItems.length > 0
        ? (reportData.bestSellingItems.reduce((sum, item) => sum + item.averagePrice, 0) / reportData.bestSellingItems.length).toFixed(2)
        : '0',
    };

    // Financial health indicators
    const financialHealth = {
      vatEfficiency: reportData.vatAmount > 0 ? 'compliant' : 'check-required',
      revenueDistribution: {
        withVat: ((reportData.totalWithVat / reportData.totalWithVat) * 100).toFixed(1),
        withoutVat: ((reportData.totalWithoutVat / reportData.totalWithVat) * 100).toFixed(1),
      },
    };

    return {
      paymentInsights,
      performanceInsights,
      salesPattern,
      bestSellersInsights,
      financialHealth,
    };
  }, [reportData]);

  return analytics;
};

/**
 * Hook to compare two EOD reports
 */
export const useEODReportComparison = (currentReport?: EODReportData, previousReport?: EODReportData) => {
  const comparison = useMemo(() => {
    if (!currentReport || !previousReport) return null;

    const revenueChange = ((currentReport.totalWithVat - previousReport.totalWithVat) / previousReport.totalWithVat) * 100;
    const orderCountChange = ((currentReport.totalOrders - previousReport.totalOrders) / previousReport.totalOrders) * 100;
    const avgOrderValueChange = ((currentReport.averageOrderValue - previousReport.averageOrderValue) / previousReport.averageOrderValue) * 100;
    const completionRateChange = currentReport.orderCompletionRate - previousReport.orderCompletionRate;
    const cancellationRateChange = currentReport.orderCancellationRate - previousReport.orderCancellationRate;

    return {
      revenue: {
        change: revenueChange,
        trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
        current: currentReport.totalWithVat,
        previous: previousReport.totalWithVat,
      },
      orders: {
        change: orderCountChange,
        trend: orderCountChange > 0 ? 'up' : orderCountChange < 0 ? 'down' : 'stable',
        current: currentReport.totalOrders,
        previous: previousReport.totalOrders,
      },
      averageOrderValue: {
        change: avgOrderValueChange,
        trend: avgOrderValueChange > 0 ? 'up' : avgOrderValueChange < 0 ? 'down' : 'stable',
        current: currentReport.averageOrderValue,
        previous: previousReport.averageOrderValue,
      },
      completionRate: {
        change: completionRateChange,
        trend: completionRateChange > 0 ? 'up' : completionRateChange < 0 ? 'down' : 'stable',
        current: currentReport.orderCompletionRate,
        previous: previousReport.orderCompletionRate,
      },
      cancellationRate: {
        change: cancellationRateChange,
        trend: cancellationRateChange > 0 ? 'up' : cancellationRateChange < 0 ? 'down' : 'stable',
        current: currentReport.orderCancellationRate,
        previous: previousReport.orderCancellationRate,
      },
    };
  }, [currentReport, previousReport]);

  return comparison;
};

/**
 * Hook to get EOD report summary statistics
 */
export const useEODReportSummary = (reportData?: EODReportData) => {
  const summary = useMemo(() => {
    if (!reportData) return null;

    return {
      // Key metrics
      totalRevenue: reportData.totalWithVat,
      totalOrders: reportData.totalOrders,
      completionRate: reportData.orderCompletionRate,
      cancellationRate: reportData.orderCancellationRate,

      // Performance indicators
      averageOrderValue: reportData.averageOrderValue,
      peakHour: reportData.peakHour,

      // Financial breakdown
      cashRevenue: reportData.totalCashOrders,
      cardRevenue: reportData.totalCardOrders,
      vatAmount: reportData.vatAmount,

      // Activity metrics
      activeHours: reportData.hourlySales.filter(h => h.orderCount > 0).length,
      bestSellingItemsCount: reportData.bestSellingItems.length,

      // Status indicators
      isHealthy: reportData.orderCompletionRate > 90 && reportData.orderCancellationRate < 10,
      needsAttention: reportData.orderCancellationRate > 15 || reportData.orderCompletionRate < 80,
    };
  }, [reportData]);

  return summary;
};

/**
 * Hook to extract chart data from EOD report
 */
export const useEODReportChartData = (reportData?: EODReportData) => {
  const chartData = useMemo(() => {
    if (!reportData) return null;

    // Hourly sales chart data
    const hourlySalesChart = reportData.hourlySales.map(hour => ({
      hour: `${hour.hour.toString().padStart(2, '0')}:00`,
      orders: hour.orderCount,
      revenue: hour.revenue,
    }));

    // Payment method pie chart data
    const paymentMethodChart = reportData.paymentBreakdown.map(payment => ({
      method: payment.method,
      amount: payment.totalAmount,
      percentage: payment.percentage,
      count: payment.orderCount,
    }));

    // Best sellers bar chart data
    const bestSellersChart = reportData.bestSellingItems.slice(0, 5).map(item => ({
      name: item.itemName,
      quantity: item.quantity,
      revenue: item.totalRevenue,
      avgPrice: item.averagePrice,
    }));

    // Order status pie chart data
    const orderStatusChart = [
      { status: 'Completed', count: reportData.completedOrders },
      { status: 'Cancelled', count: reportData.totalCancelledOrders },
    ];

    return {
      hourlySales: hourlySalesChart,
      paymentMethods: paymentMethodChart,
      bestSellers: bestSellersChart,
      orderStatus: orderStatusChart,
    };
  }, [reportData]);

  return chartData;
};

/**
 * Hook to get EOD report export data
 */
export const useEODReportExport = () => {
  const exportToCSV = (reportData: EODReportData) => {
    const csvData = [
      ['Metric', 'Value'],
      ['Report Date', reportData.startDateTime.toISOString().split('T')[0]],
      ['Total Revenue (with VAT)', reportData.totalWithVat],
      ['Total Revenue (without VAT)', reportData.totalWithoutVat],
      ['VAT Amount', reportData.vatAmount],
      ['Total Orders', reportData.totalOrders],
      ['Completed Orders', reportData.completedOrders],
      ['Cancelled Orders', reportData.totalCancelledOrders],
      ['Cash Orders Total', reportData.totalCashOrders],
      ['Card Orders Total', reportData.totalCardOrders],
      ['Average Order Value', reportData.averageOrderValue],
      ['Peak Hour', reportData.peakHour || 'N/A'],
      ['Completion Rate (%)', reportData.orderCompletionRate],
      ['Cancellation Rate (%)', reportData.orderCancellationRate],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eod-report-${reportData.startDateTime.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (reportData: EODReportData) => {
    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eod-report-${reportData.startDateTime.toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    exportToCSV,
    exportToJSON,
  };
};

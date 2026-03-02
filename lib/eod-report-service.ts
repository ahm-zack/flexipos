// Supabase-native EOD report service
import { createAdminClient } from '@/utils/supabase/admin';
import { generateEODReportNumber } from './eod-report/server-utils';
// import { createClient } from '@/utils/supabase/client'; // Temporarily disabled
import {
  EODReportDataSchema,
  EODReportRequestSchema,
  type EODReportData,
  type EODReportRequest,
  type BestSellingItem,
  type PaymentBreakdown,
  type DeliveryPlatformBreakdown,
  type HourlySales,
  type PaymentMethod,
  type DeliveryPlatform
} from './schemas';
import { calculateVATBreakdown } from './vat-config';

/**
 * Core EOD Report Generation Service
 * 
 * This service provides functional programming approach to generate
 * End of Day reports with comprehensive business metrics.
 */

// Type definitions for internal calculations
interface OrderItem {
  id: string;
  name?: string;
  nameEn?: string;
  nameAr?: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  details?: Record<string, unknown>;
}

interface OrderWithDetails {
  id: string;
  orderNumber: string;
  customerName: string | null;
  items: OrderItem[];
  totalAmount: string;
  paymentMethod: 'cash' | 'card' | 'mixed' | 'delivery';
  deliveryPlatform?: 'keeta' | 'hunger_station' | 'jahez' | null;
  status: 'completed' | 'canceled' | 'modified';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  // Payment tracking fields
  cashAmount?: string | null;
  cardAmount?: string | null;
  cashReceived?: string | null;
  changeAmount?: string | null;
}

interface CanceledOrderWithDetails {
  id: string;
  originalOrderId: string;
  canceledAt: Date;
  canceledBy: string;
  reason: string | null;
  orderData: Record<string, unknown>;
}

// Constants
// VAT_RATE constant removed - now handled by VAT configuration

/**
 * Validates an EOD report request
 */
export const validateEODReportRequest = (request: unknown): EODReportRequest => {
  return EODReportRequestSchema.parse(request);
};

/**
 * Fetches all orders within the specified date range
 */
const fetchOrdersInRange = async (startDate: Date, endDate: Date): Promise<OrderWithDetails[]> => {
  const adminClient = createAdminClient();
  const { data: result, error } = await adminClient
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed', 'modified'])
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Parse the items JSON field
  return (result ?? []).map(order => ({
    ...order,
    // camelCase mapping
    orderNumber: order.order_number,
    customerName: order.customer_name,
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method,
    deliveryPlatform: order.delivery_platform,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    createdBy: order.created_by,
    cashAmount: order.cash_amount,
    cardAmount: order.card_amount,
    cashReceived: order.cash_received,
    changeAmount: order.change_amount,
    items: Array.isArray(order.items) ? order.items : JSON.parse(order.items as string),
  })) as OrderWithDetails[];
};

/**
 * Fetches all canceled orders within the specified date range
 */
const fetchCanceledOrdersInRange = async (startDate: Date, endDate: Date): Promise<CanceledOrderWithDetails[]> => {
  const adminClient = createAdminClient();
  const { data: result, error } = await adminClient
    .from('canceled_orders')
    .select('*')
    .gte('canceled_at', startDate.toISOString())
    .lte('canceled_at', endDate.toISOString())
    .order('canceled_at', { ascending: true });

  if (error) throw error;

  return (result ?? []).map(order => ({
    ...order,
    originalOrderId: order.original_order_id,
    canceledAt: new Date(order.canceled_at),
    canceledBy: order.canceled_by,
    orderData: typeof order.order_data === 'string' ? JSON.parse(order.order_data) : order.order_data,
  })) as CanceledOrderWithDetails[];
};

/**
 * Calculates total revenue from orders
 */
const calculateTotalRevenue = (orders: OrderWithDetails[]): number => {
  const total = orders.reduce((sum, order) => {
    const amount = parseFloat(order.totalAmount || '0');
    return sum + amount;
  }, 0);

  return Math.round(total * 100) / 100;
};

/**
 * Calculates cash/card totals using actual payment amounts
 */
const calculateCashAndCardTotals = (orders: OrderWithDetails[]) => {
  let cashTotal = 0;
  let cardTotal = 0;
  let cashReceived = 0;
  let changeGiven = 0;

  orders.forEach(order => {
    const orderAmount = parseFloat(order.totalAmount || '0');
    const cashAmount = parseFloat(order.cashAmount || '0');
    const cardAmount = parseFloat(order.cardAmount || '0');
    const cashReceivedAmount = parseFloat(order.cashReceived || '0');
    const changeAmount = parseFloat(order.changeAmount || '0');

    if (order.paymentMethod === 'cash') {
      cashTotal += orderAmount;
      cashReceived += cashReceivedAmount;
      changeGiven += changeAmount;
    } else if (order.paymentMethod === 'card') {
      cardTotal += orderAmount;
    } else if (order.paymentMethod === 'mixed') {
      // For mixed payments, use the actual split amounts
      cashTotal += cashAmount;
      cardTotal += cardAmount;
      cashReceived += cashReceivedAmount;
      changeGiven += changeAmount;
    }
  });

  return {
    cashTotal: Math.round(cashTotal * 100) / 100,
    cardTotal: Math.round(cardTotal * 100) / 100,
    cashReceived: Math.round(cashReceived * 100) / 100,
    changeGiven: Math.round(changeGiven * 100) / 100
  };
};

/**
 * Calculates payment method breakdown - splits mixed payments into cash/card components and tracks delivery
 */
const calculatePaymentBreakdown = (orders: OrderWithDetails[]): PaymentBreakdown[] => {
  const breakdown = {
    cash: { amount: 0, count: 0 },
    card: { amount: 0, count: 0 },
    delivery: { amount: 0, count: 0 }
  };

  orders.forEach(order => {
    const cashAmount = parseFloat(order.cashAmount || '0');
    const cardAmount = parseFloat(order.cardAmount || '0');

    if (order.paymentMethod === 'cash') {
      const amount = parseFloat(order.totalAmount || '0');
      breakdown.cash.amount += amount;
      breakdown.cash.count += 1;
    } else if (order.paymentMethod === 'card') {
      const amount = parseFloat(order.totalAmount || '0');
      breakdown.card.amount += amount;
      breakdown.card.count += 1;
    } else if (order.paymentMethod === 'delivery') {
      const amount = parseFloat(order.totalAmount || '0');
      breakdown.delivery.amount += amount;
      breakdown.delivery.count += 1;
    } else if (order.paymentMethod === 'mixed') {
      // Split mixed payments: add cash portion to cash, card portion to card
      if (cashAmount > 0) {
        breakdown.cash.amount += cashAmount;
        breakdown.cash.count += 1; // Count as cash order for the cash portion
      }
      if (cardAmount > 0) {
        breakdown.card.amount += cardAmount;
        breakdown.card.count += 1; // Count as card order for the card portion
      }
    }
  });

  const totalRevenue = calculateTotalRevenue(orders);

  return [
    {
      method: 'cash' as PaymentMethod,
      orderCount: breakdown.cash.count,
      totalAmount: Math.round(breakdown.cash.amount * 100) / 100,
      percentage: totalRevenue > 0 ? Math.round((breakdown.cash.amount / totalRevenue) * 100 * 100) / 100 : 0
    },
    {
      method: 'card' as PaymentMethod,
      orderCount: breakdown.card.count,
      totalAmount: Math.round(breakdown.card.amount * 100) / 100,
      percentage: totalRevenue > 0 ? Math.round((breakdown.card.amount / totalRevenue) * 100 * 100) / 100 : 0
    },
    {
      method: 'delivery' as PaymentMethod,
      orderCount: breakdown.delivery.count,
      totalAmount: Math.round(breakdown.delivery.amount * 100) / 100,
      percentage: totalRevenue > 0 ? Math.round((breakdown.delivery.amount / totalRevenue) * 100 * 100) / 100 : 0
    }
  ].filter(item => item.totalAmount > 0); // Only show payment methods that have amounts
};

/**
 * Calculates delivery platform breakdown for delivery orders
 */
const calculateDeliveryPlatformBreakdown = (orders: OrderWithDetails[]): DeliveryPlatformBreakdown[] => {
  const breakdown: Record<DeliveryPlatform, { amount: number; count: number }> = {
    keeta: { amount: 0, count: 0 },
    hunger_station: { amount: 0, count: 0 },
    jahez: { amount: 0, count: 0 }
  };

  // Only process delivery orders
  const deliveryOrders = orders.filter(order => order.paymentMethod === 'delivery');

  deliveryOrders.forEach(order => {
    const amount = parseFloat(order.totalAmount || '0');
    const platform = order.deliveryPlatform;

    if (platform && breakdown[platform]) {
      breakdown[platform].amount += amount;
      breakdown[platform].count += 1;
    }
  });

  const totalDeliveryAmount = Object.values(breakdown).reduce((sum, item) => sum + item.amount, 0);

  return [
    {
      platform: 'keeta' as DeliveryPlatform,
      orderCount: breakdown.keeta.count,
      totalAmount: Math.round(breakdown.keeta.amount * 100) / 100,
      percentage: totalDeliveryAmount > 0 ? Math.round((breakdown.keeta.amount / totalDeliveryAmount) * 100 * 100) / 100 : 0
    },
    {
      platform: 'hunger_station' as DeliveryPlatform,
      orderCount: breakdown.hunger_station.count,
      totalAmount: Math.round(breakdown.hunger_station.amount * 100) / 100,
      percentage: totalDeliveryAmount > 0 ? Math.round((breakdown.hunger_station.amount / totalDeliveryAmount) * 100 * 100) / 100 : 0
    },
    {
      platform: 'jahez' as DeliveryPlatform,
      orderCount: breakdown.jahez.count,
      totalAmount: Math.round(breakdown.jahez.amount * 100) / 100,
      percentage: totalDeliveryAmount > 0 ? Math.round((breakdown.jahez.amount / totalDeliveryAmount) * 100 * 100) / 100 : 0
    }
  ].filter(item => item.totalAmount > 0); // Only show platforms that have orders
};

/**
 * Calculates all sold items with proper aggregation by name and type
 */
const calculateBestSellingItems = (orders: OrderWithDetails[]): BestSellingItem[] => {
  const itemStats: Record<string, {
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    type: string;
  }> = {};

  orders.forEach(order => {
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const name = item.name || item.nameEn || item.nameAr || 'Unknown Item';
        // Use name and type as key to ensure items with same name are grouped together
        const key = `${name}_${item.type}`.toLowerCase();

        if (!itemStats[key]) {
          itemStats[key] = {
            name,
            totalQuantity: 0,
            totalRevenue: 0,
            type: item.type
          };
        }

        itemStats[key].totalQuantity += item.quantity || 0;
        itemStats[key].totalRevenue += item.totalPrice || 0;
      });
    }
  });

  // Return ALL items sorted by quantity
  return Object.values(itemStats)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .map(item => ({
      itemName: item.name,
      itemType: item.type as 'pizza' | 'pie' | 'sandwich' | 'mini_pie' | 'beverage' | 'appetizer' | 'burger' | 'shawerma' | 'side-order',
      quantity: item.totalQuantity,
      totalRevenue: Math.round(item.totalRevenue * 100) / 100,
      averagePrice: item.totalQuantity > 0 ? Math.round((item.totalRevenue / item.totalQuantity) * 100) / 100 : 0
    }));
};

/**
 * Calculates hourly sales breakdown
 */
const calculateHourlySales = (orders: OrderWithDetails[]): HourlySales[] => {
  const hourlyData: Record<number, { count: number; revenue: number }> = {};

  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourlyData[hour] = { count: 0, revenue: 0 };
  }

  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    const amount = parseFloat(order.totalAmount || '0');

    hourlyData[hour].count += 1;
    hourlyData[hour].revenue += amount;
  });

  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    orderCount: data.count,
    revenue: Math.round(data.revenue * 100) / 100
  }));
};

/**
 * Finds peak hour based on order count
 */
const findPeakHour = (hourlySales: HourlySales[]): string => {
  const peakHour = hourlySales.reduce((max, current) =>
    current.orderCount > max.orderCount ? current : max
  );

  return `${peakHour.hour}:00`;
};

/**
 * Main function to generate EOD report
 */
export const generateEODReport = async (request: EODReportRequest): Promise<EODReportData> => {
  // Validate request
  const validatedRequest = EODReportRequestSchema.parse(request);

  // Convert string dates to Date objects
  const startDateTime = new Date(validatedRequest.startDateTime);
  const endDateTime = new Date(validatedRequest.endDateTime);

  // Fetch data
  const [completedOrders, canceledOrdersData] = await Promise.all([
    fetchOrdersInRange(startDateTime, endDateTime),
    fetchCanceledOrdersInRange(startDateTime, endDateTime)
  ]);

  // Calculate metrics
  const totalRevenue = calculateTotalRevenue(completedOrders);
  const { cashTotal, cardTotal, cashReceived, changeGiven } = calculateCashAndCardTotals(completedOrders);
  const vatBreakdown = calculateVATBreakdown(totalRevenue);
  const paymentBreakdown = calculatePaymentBreakdown(completedOrders);
  const deliveryPlatformBreakdown = calculateDeliveryPlatformBreakdown(completedOrders);
  const bestSellingItems = calculateBestSellingItems(completedOrders);
  const hourlySales = calculateHourlySales(completedOrders);
  const peakHour = findPeakHour(hourlySales);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const completionRate = (completedOrders.length + canceledOrdersData.length) > 0
    ? (completedOrders.length / (completedOrders.length + canceledOrdersData.length)) * 100
    : 100;

  // Build report according to schema
  const reportData: EODReportData = {
    startDateTime,
    endDateTime,
    reportGeneratedAt: new Date(),

    // Core metrics
    totalCashOrders: cashTotal,
    totalCardOrders: cardTotal,
    totalWithVat: Math.round(totalRevenue * 100) / 100,
    totalWithoutVat: Math.round(vatBreakdown.netAmount * 100) / 100,
    totalCancelledOrders: canceledOrdersData.length,
    totalOrders: completedOrders.length,

    // Detailed payment tracking
    totalCashReceived: cashReceived,
    totalChangeGiven: changeGiven,

    // Additional order statistics
    completedOrders: completedOrders.length,

    // Financial breakdown
    vatAmount: Math.round(vatBreakdown.vatAmount * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,

    // Payment method breakdown
    paymentBreakdown,

    // Delivery platform breakdown
    deliveryPlatformBreakdown,

    // Performance metrics
    bestSellingItems,
    peakHour,
    hourlySales,

    // Operational metrics
    orderCompletionRate: Math.round(completionRate * 100) / 100,
    orderCancellationRate: Math.round((100 - completionRate) * 100) / 100,
  };

  // Validate the final report
  const validatedReport = EODReportDataSchema.parse(reportData);

  // After successful EOD generation, reset daily serial for the next day
  await resetDailySerialSequence();

  return validatedReport;
};

/**
 * Reset the daily serial sequence for the next business day
 * This should be called after EOD report generation
 */
const resetDailySerialSequence = async (): Promise<void> => {
  try {
    const adminClient = createAdminClient();
    await adminClient.rpc('reset_daily_serial_sequence');
    console.log('✅ Daily serial sequence reset successfully');
  } catch (error) {
    console.error('⚠️ Failed to reset daily serial sequence:', error);
  }
};

/**
 * Saves an EOD report to the database
 */
export const saveEODReportToDatabase = async (
  reportData: EODReportData,
  generatedBy: string
): Promise<string> => {
  // Generate the report number
  const reportNumber = await generateEODReportNumber();

  // Calculate cash and card order counts from payment breakdown
  const cashOrdersCount = reportData.paymentBreakdown.find(p => p.method === 'cash')?.orderCount || 0;
  const cardOrdersCount = reportData.paymentBreakdown.find(p => p.method === 'card')?.orderCount || 0;

  const reportToSave = {
    reportNumber,
    reportDate: reportData.startDateTime.toISOString().split('T')[0],
    startDateTime: reportData.startDateTime,
    endDateTime: reportData.endDateTime,
    totalOrders: reportData.totalOrders,
    completedOrders: reportData.completedOrders,
    cancelledOrders: reportData.totalCancelledOrders,
    totalRevenue: reportData.totalWithVat.toString(),
    totalWithVat: reportData.totalWithVat.toString(),
    totalWithoutVat: reportData.totalWithoutVat.toString(),
    vatAmount: reportData.vatAmount.toString(),
    totalCashOrders: reportData.totalCashOrders.toString(),
    totalCardOrders: reportData.totalCardOrders.toString(),
    cashOrdersCount,
    cardOrdersCount,
    totalCashReceived: reportData.totalCashReceived.toString(),
    totalChangeGiven: reportData.totalChangeGiven.toString(),
    averageOrderValue: reportData.averageOrderValue.toString(),
    peakHour: reportData.peakHour,
    orderCompletionRate: reportData.orderCompletionRate.toString(),
    orderCancellationRate: reportData.orderCancellationRate.toString(),
    paymentBreakdown: JSON.stringify(reportData.paymentBreakdown),
    deliveryPlatformBreakdown: JSON.stringify(reportData.deliveryPlatformBreakdown),
    bestSellingItems: JSON.stringify(reportData.bestSellingItems),
    hourlySales: JSON.stringify(reportData.hourlySales),
    generatedBy,
    generatedAt: new Date(),
  };

  const adminClient = createAdminClient();
  const { data: result, error } = await adminClient
    .from('eod_reports')
    .insert({
      report_number: reportToSave.reportNumber,
      report_date: reportToSave.reportDate,
      start_date_time: reportToSave.startDateTime instanceof Date ? reportToSave.startDateTime.toISOString() : reportToSave.startDateTime,
      end_date_time: reportToSave.endDateTime instanceof Date ? reportToSave.endDateTime.toISOString() : reportToSave.endDateTime,
      total_orders: reportToSave.totalOrders,
      completed_orders: reportToSave.completedOrders,
      cancelled_orders: reportToSave.cancelledOrders,
      total_revenue: reportToSave.totalRevenue,
      total_with_vat: reportToSave.totalWithVat,
      total_without_vat: reportToSave.totalWithoutVat,
      vat_amount: reportToSave.vatAmount,
      total_cash_orders: reportToSave.totalCashOrders,
      total_card_orders: reportToSave.totalCardOrders,
      cash_orders_count: reportToSave.cashOrdersCount,
      card_orders_count: reportToSave.cardOrdersCount,
      total_cash_received: reportToSave.totalCashReceived,
      total_change_given: reportToSave.totalChangeGiven,
      average_order_value: reportToSave.averageOrderValue,
      peak_hour: reportToSave.peakHour,
      order_completion_rate: reportToSave.orderCompletionRate,
      order_cancellation_rate: reportToSave.orderCancellationRate,
      payment_breakdown: reportToSave.paymentBreakdown,
      delivery_platform_breakdown: reportToSave.deliveryPlatformBreakdown,
      best_selling_items: reportToSave.bestSellingItems,
      hourly_sales: reportToSave.hourlySales,
      generated_by: reportToSave.generatedBy,
      generated_at: reportToSave.generatedAt instanceof Date ? reportToSave.generatedAt.toISOString() : reportToSave.generatedAt,
    })
    .select('id')
    .single();

  if (error || !result) throw error ?? new Error('Failed to save EOD report');

  // Reset daily serial sequence after EOD report is generated
  // NOTE: Temporarily disabled as function doesn't exist in current schema
  try {
    // const supabase = createClient();
    // await supabase.rpc('reset_daily_serial_sequence');
    console.log(`Daily serial reset skipped for EOD report: ${reportNumber} (function not available)`);
  } catch (error) {
    console.error('Failed to reset daily serial:', error);
    // Don't throw error - EOD report was saved successfully
  }

  return result.id;
};

/**
 * Retrieves EOD reports history with pagination
 */
export const getEODReportsHistory = async (
  page: number = 1,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) => {
  const offset = (page - 1) * limit;

  const adminClient = createAdminClient();
  let query = adminClient
    .from('eod_reports')
    .select('*', { count: 'exact' });

  if (startDate && endDate) {
    query = query
      .gte('report_date', startDate.toISOString().split('T')[0])
      .lte('report_date', endDate.toISOString().split('T')[0]);
  }

  const { data: reports, count, error } = await query
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    reports,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Retrieves a specific EOD report by ID
 */
export const getEODReportById = async (reportId: string) => {
  const adminClient = createAdminClient();
  const { data: report, error } = await adminClient
    .from('eod_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error || !report) {
    throw new Error(`EOD report with ID ${reportId} not found`);
  }

  // Convert the database record back to EODReportData format
  const reportData: EODReportData = {
    startDateTime: report.start_date_time ? new Date(report.start_date_time) : report.startDateTime,
    endDateTime: report.end_date_time ? new Date(report.end_date_time) : report.endDateTime,
    reportGeneratedAt: report.generated_at ? new Date(report.generated_at) : report.generatedAt,

    // Core metrics
    totalCashOrders: parseFloat(report.total_cash_orders ?? report.totalCashOrders),
    totalCardOrders: parseFloat(report.total_card_orders ?? report.totalCardOrders),
    totalWithVat: parseFloat(report.total_with_vat ?? report.totalWithVat),
    totalWithoutVat: parseFloat(report.total_without_vat ?? report.totalWithoutVat),
    totalCancelledOrders: report.cancelled_orders ?? report.cancelledOrders,
    totalOrders: report.total_orders ?? report.totalOrders,

    // Detailed payment tracking
    totalCashReceived: parseFloat(report.total_cash_received ?? report.totalCashReceived ?? '0'),
    totalChangeGiven: parseFloat(report.total_change_given ?? report.totalChangeGiven ?? '0'),

    // Additional order statistics
    completedOrders: report.completed_orders ?? report.completedOrders,

    // Financial breakdown
    vatAmount: parseFloat(report.vat_amount ?? report.vatAmount),
    averageOrderValue: parseFloat(report.average_order_value ?? report.averageOrderValue),

    // Payment method breakdown
    paymentBreakdown: JSON.parse((report.payment_breakdown ?? report.paymentBreakdown) as string) as PaymentBreakdown[],

    // Delivery platform breakdown
    deliveryPlatformBreakdown: JSON.parse(((report.delivery_platform_breakdown ?? report.deliveryPlatformBreakdown) as string) || '[]') as DeliveryPlatformBreakdown[],

    // Performance metrics
    bestSellingItems: JSON.parse((report.best_selling_items ?? report.bestSellingItems) as string) as BestSellingItem[],
    peakHour: report.peak_hour ?? report.peakHour ?? '12:00',
    hourlySales: JSON.parse((report.hourly_sales ?? report.hourlySales) as string) as HourlySales[],

    // Operational metrics
    orderCompletionRate: parseFloat(report.order_completion_rate ?? report.orderCompletionRate),
    orderCancellationRate: parseFloat(report.order_cancellation_rate ?? report.orderCancellationRate),
  };

  return reportData;
};

/**
 * Helper function to get common date presets
 */
export const getDatePresets = () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterday = new Date(endOfToday);
  endOfYesterday.setDate(endOfYesterday.getDate() - 1);

  const startOfLast7Days = new Date(startOfToday);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 7);

  return {
    today: { startDateTime: startOfToday, endDateTime: endOfToday },
    yesterday: { startDateTime: startOfYesterday, endDateTime: endOfYesterday },
    'last-7-days': { startDateTime: startOfLast7Days, endDateTime: endOfToday },
  };
};

/**
 * Helper function to get report presets - alias for getDatePresets
 */
export const getReportPresets = getDatePresets;

/**
 * Formats currency amount using Saudi Riyal (SAR)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats percentage with appropriate decimal places
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

/**
 * Deletes an EOD report by ID
 */
export const deleteEODReport = async (reportId: string): Promise<void> => {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('eod_reports')
      .delete()
      .eq('id', reportId)
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(`EOD report with ID ${reportId} not found`);
    }

    console.log(`EOD report ${reportId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting EOD report ${reportId}:`, error);
    throw error;
  }
};
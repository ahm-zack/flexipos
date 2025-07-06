import { db } from './db';
import { orders, canceledOrders, eodReports, type NewEODReport } from './db/schema';
import { and, between, eq, sql, desc, asc } from 'drizzle-orm';
import { 
  EODReportDataSchema, 
  EODReportRequestSchema, 
  type EODReportData, 
  type EODReportRequest,
  type BestSellingItem,
  type PaymentBreakdown,
  type HourlySales,
  type PaymentMethod
} from './schemas';

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
  paymentMethod: 'cash' | 'card' | 'mixed';
  status: 'completed' | 'canceled' | 'modified';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
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
const VAT_RATE = 0.15; // 15% VAT rate

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
  const result = await db
    .select()
    .from(orders)
    .where(
      and(
        between(orders.createdAt, startDate, endDate),
        sql`${orders.status} IN ('completed', 'modified')`
      )
    )
    .orderBy(asc(orders.createdAt));
  
  // Parse the items JSON field
  return result.map(order => ({
    ...order,
    items: Array.isArray(order.items) ? order.items : JSON.parse(order.items as string)
  })) as OrderWithDetails[];
};

/**
 * Fetches all canceled orders within the specified date range
 */
const fetchCanceledOrdersInRange = async (startDate: Date, endDate: Date): Promise<CanceledOrderWithDetails[]> => {
  const result = await db
    .select()
    .from(canceledOrders)
    .where(
      between(canceledOrders.canceledAt, startDate, endDate)
    )
    .orderBy(asc(canceledOrders.canceledAt));
  
  // Parse the orderData JSON field
  return result.map(order => ({
    ...order,
    orderData: typeof order.orderData === 'string' ? JSON.parse(order.orderData) : order.orderData
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
 * Calculates cash/card totals
 */
const calculateCashAndCardTotals = (orders: OrderWithDetails[]) => {
  let cashTotal = 0;
  let cardTotal = 0;
  
  orders.forEach(order => {
    const amount = parseFloat(order.totalAmount || '0');
    if (order.paymentMethod === 'cash') {
      cashTotal += amount;
    } else if (order.paymentMethod === 'card') {
      cardTotal += amount;
    }
    // 'mixed' payments are split - for now, we'll count them as card
    else if (order.paymentMethod === 'mixed') {
      cardTotal += amount;
    }
  });
  
  return {
    cashTotal: Math.round(cashTotal * 100) / 100,
    cardTotal: Math.round(cardTotal * 100) / 100
  };
};

/**
 * Calculates payment method breakdown
 */
const calculatePaymentBreakdown = (orders: OrderWithDetails[]): PaymentBreakdown[] => {
  const breakdown: Record<PaymentMethod, { amount: number; count: number }> = {
    cash: { amount: 0, count: 0 },
    card: { amount: 0, count: 0 },
    mixed: { amount: 0, count: 0 }
  };

  orders.forEach(order => {
    const amount = parseFloat(order.totalAmount || '0');
    const paymentMethod = order.paymentMethod as PaymentMethod;
    
    if (breakdown[paymentMethod]) {
      breakdown[paymentMethod].amount += amount;
      breakdown[paymentMethod].count += 1;
    }
  });

  const totalRevenue = calculateTotalRevenue(orders);
  
  return Object.entries(breakdown).map(([method, data]) => ({
    method: method as PaymentMethod,
    orderCount: data.count,
    totalAmount: Math.round(data.amount * 100) / 100,
    percentage: totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100 * 100) / 100 : 0
  }));
};

/**
 * Calculates best selling items
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
        const key = `${item.id}_${item.type}`;
        const name = item.name || item.nameEn || item.nameAr || 'Unknown Item';
        
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

  return Object.values(itemStats)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10)
    .map(item => ({
      itemName: item.name,
      itemType: item.type as 'pizza' | 'pie' | 'sandwich' | 'mini-pie' | 'beverage' | 'appetizer' | 'burger' | 'shawerma' | 'side-order',
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
  const { cashTotal, cardTotal } = calculateCashAndCardTotals(completedOrders);
  const vatAmount = totalRevenue * VAT_RATE;
  const netRevenue = totalRevenue - vatAmount;
  const paymentBreakdown = calculatePaymentBreakdown(completedOrders);
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
    totalWithoutVat: Math.round(netRevenue * 100) / 100,
    totalCancelledOrders: canceledOrdersData.length,
    totalOrders: completedOrders.length,
    
    // Additional order statistics
    completedOrders: completedOrders.length,
    pendingOrders: 0, // We don't have pending orders in this range
    
    // Financial breakdown
    vatAmount: Math.round(vatAmount * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    
    // Payment method breakdown
    paymentBreakdown,
    
    // Performance metrics
    bestSellingItems,
    peakHour,
    hourlySales,
    
    // Operational metrics
    orderCompletionRate: Math.round(completionRate * 100) / 100,
    orderCancellationRate: Math.round((100 - completionRate) * 100) / 100,
  };

  // Validate the final report
  return EODReportDataSchema.parse(reportData);
};

/**
 * Saves an EOD report to the database
 */
export const saveEODReportToDatabase = async (
  reportData: EODReportData, 
  generatedBy: string
): Promise<string> => {
  // Calculate cash and card order counts from payment breakdown
  const cashOrdersCount = reportData.paymentBreakdown.find(p => p.method === 'cash')?.orderCount || 0;
  const cardOrdersCount = reportData.paymentBreakdown.find(p => p.method === 'card')?.orderCount || 0;
  
  const reportToSave: NewEODReport = {
    reportDate: reportData.startDateTime.toISOString().split('T')[0],
    startDateTime: reportData.startDateTime,
    endDateTime: reportData.endDateTime,
    totalOrders: reportData.totalOrders,
    completedOrders: reportData.completedOrders,
    cancelledOrders: reportData.totalCancelledOrders,
    pendingOrders: reportData.pendingOrders,
    totalRevenue: reportData.totalWithVat.toString(),
    totalWithVat: reportData.totalWithVat.toString(),
    totalWithoutVat: reportData.totalWithoutVat.toString(),
    vatAmount: reportData.vatAmount.toString(),
    totalCashOrders: reportData.totalCashOrders.toString(),
    totalCardOrders: reportData.totalCardOrders.toString(),
    cashOrdersCount,
    cardOrdersCount,
    averageOrderValue: reportData.averageOrderValue.toString(),
    peakHour: reportData.peakHour,
    orderCompletionRate: reportData.orderCompletionRate.toString(),
    orderCancellationRate: reportData.orderCancellationRate.toString(),
    paymentBreakdown: JSON.stringify(reportData.paymentBreakdown),
    bestSellingItems: JSON.stringify(reportData.bestSellingItems),
    hourlySales: JSON.stringify(reportData.hourlySales),
    generatedBy,
    generatedAt: new Date(),
  };

  const result = await db.insert(eodReports).values(reportToSave).returning({ id: eodReports.id });
  return result[0].id;
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
  
  // Build the where condition
  const whereCondition = startDate && endDate
    ? between(eodReports.reportDate, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
    : undefined;

  const [reports, countResult] = await Promise.all([
    db
      .select({
        id: eodReports.id,
        reportDate: eodReports.reportDate,
        startDateTime: eodReports.startDateTime,
        endDateTime: eodReports.endDateTime,
        totalOrders: eodReports.totalOrders,
        completedOrders: eodReports.completedOrders,
        cancelledOrders: eodReports.cancelledOrders,
        pendingOrders: eodReports.pendingOrders,
        totalRevenue: eodReports.totalRevenue,
        totalWithVat: eodReports.totalWithVat,
        totalWithoutVat: eodReports.totalWithoutVat,
        vatAmount: eodReports.vatAmount,
        totalCashOrders: eodReports.totalCashOrders,
        totalCardOrders: eodReports.totalCardOrders,
        averageOrderValue: eodReports.averageOrderValue,
        peakHour: eodReports.peakHour,
        orderCompletionRate: eodReports.orderCompletionRate,
        orderCancellationRate: eodReports.orderCancellationRate,
        paymentBreakdown: eodReports.paymentBreakdown,
        bestSellingItems: eodReports.bestSellingItems,
        hourlySales: eodReports.hourlySales,
        generatedBy: eodReports.generatedBy,
        generatedAt: eodReports.generatedAt,
        reportType: eodReports.reportType,
        createdAt: eodReports.createdAt,
        updatedAt: eodReports.updatedAt,
      })
      .from(eodReports)
      .where(whereCondition)
      .orderBy(desc(eodReports.generatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(eodReports)
      .where(whereCondition)
  ]);

  const totalCount = countResult[0]?.count || 0;
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
  const result = await db
    .select()
    .from(eodReports)
    .where(eq(eodReports.id, reportId))
    .limit(1);

  if (result.length === 0) {
    throw new Error(`EOD report with ID ${reportId} not found`);
  }

  const report = result[0];
  
  // Convert the database record back to EODReportData format
  const reportData: EODReportData = {
    startDateTime: report.startDateTime,
    endDateTime: report.endDateTime,
    reportGeneratedAt: report.generatedAt,
    
    // Core metrics
    totalCashOrders: parseFloat(report.totalCashOrders),
    totalCardOrders: parseFloat(report.totalCardOrders),
    totalWithVat: parseFloat(report.totalWithVat),
    totalWithoutVat: parseFloat(report.totalWithoutVat),
    totalCancelledOrders: report.cancelledOrders,
    totalOrders: report.totalOrders,
    
    // Additional order statistics
    completedOrders: report.completedOrders,
    pendingOrders: report.pendingOrders,
    
    // Financial breakdown
    vatAmount: parseFloat(report.vatAmount),
    averageOrderValue: parseFloat(report.averageOrderValue),
    
    // Payment method breakdown
    paymentBreakdown: JSON.parse(report.paymentBreakdown as string) as PaymentBreakdown[],
    
    // Performance metrics
    bestSellingItems: JSON.parse(report.bestSellingItems as string) as BestSellingItem[],
    peakHour: report.peakHour || '12:00',
    hourlySales: JSON.parse(report.hourlySales as string) as HourlySales[],
    
    // Operational metrics
    orderCompletionRate: parseFloat(report.orderCompletionRate),
    orderCancellationRate: parseFloat(report.orderCancellationRate),
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
    const result = await db
      .delete(eodReports)
      .where(eq(eodReports.id, reportId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`EOD report with ID ${reportId} not found`);
    }
    
    console.log(`EOD report ${reportId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting EOD report ${reportId}:`, error);
    throw error;
  }
};
/**
 * Sales Report Service – Supabase client-side (no API routes)
 * Generates printable date-range sales reports.
 */

import { createClient } from '@/utils/supabase/client';
import { computeMetrics, calcDailySales } from './compute';
import type { RawOrder, SalesReportData, SavedSalesReport } from './types';

// ─────────────────────────────────────────────────────────────────────────
// Fetch orders in a date range (completed/modified)
// ─────────────────────────────────────────────────────────────────────────
const fetchOrdersInRange = async (
    businessId: string,
    startDate: Date,
    endDate: Date
): Promise<RawOrder[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .in('status', ['completed', 'modified'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return (data ?? []) as unknown as RawOrder[];
};

// ─────────────────────────────────────────────────────────────────────────
// Count cancelled orders in range
// ─────────────────────────────────────────────────────────────────────────
const countCancelledInRange = async (
    businessId: string,
    startDate: Date,
    endDate: Date
): Promise<number> => {
    const supabase = createClient();
    const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'canceled')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    return count ?? 0;
};

// ─────────────────────────────────────────────────────────────────────────
// Preview a sales report (no save)
// ─────────────────────────────────────────────────────────────────────────
export const previewSalesReport = async (
    businessId: string,
    generatedBy: string,
    startDate: Date,
    endDate: Date,
    reportName?: string
): Promise<SalesReportData> => {
    const [orders, cancelledCount] = await Promise.all([
        fetchOrdersInRange(businessId, startDate, endDate),
        countCancelledInRange(businessId, startDate, endDate),
    ]);

    const metrics = computeMetrics(orders, cancelledCount);
    const dailySales = calcDailySales(orders);

    return {
        ...metrics,
        businessId,
        reportName,
        periodStart: startDate,
        periodEnd: endDate,
        generatedBy,
        dailySales,
    };
};

// ─────────────────────────────────────────────────────────────────────────
// Generate + save a sales report
// ─────────────────────────────────────────────────────────────────────────
export const generateAndSaveSalesReport = async (
    businessId: string,
    generatedBy: string,
    startDate: Date,
    endDate: Date,
    reportName?: string
): Promise<SavedSalesReport> => {
    const supabase = createClient();

    if (startDate >= endDate) throw new Error('Start date must be before end date');

    const [orders, cancelledCount] = await Promise.all([
        fetchOrdersInRange(businessId, startDate, endDate),
        countCancelledInRange(businessId, startDate, endDate),
    ]);

    const metrics = computeMetrics(orders, cancelledCount);
    const dailySales = calcDailySales(orders);

    const toSave = {
        business_id: businessId,
        report_name: reportName ?? `Sales Report ${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        total_orders: metrics.totalOrders,
        completed_orders: metrics.completedOrders,
        cancelled_orders: metrics.cancelledOrders,
        total_revenue: metrics.totalRevenue.toString(),
        total_discount: metrics.totalDiscount.toString(),
        total_vat: metrics.totalVat.toString(),
        revenue_ex_vat: metrics.revenueExVat.toString(),
        cash_revenue: metrics.cashRevenue.toString(),
        card_revenue: metrics.cardRevenue.toString(),
        delivery_revenue: metrics.deliveryRevenue.toString(),
        average_order_value: metrics.averageOrderValue.toString(),
        payment_breakdown: metrics.paymentBreakdown,
        top_items: metrics.topItems,
        category_breakdown: metrics.categoryBreakdown,
        daily_sales: dailySales,
        hourly_sales: metrics.hourlySales,
        generated_by: generatedBy,
    };

    const { data, error } = await supabase
        .from('sales_reports')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(toSave as any)
        .select('*')
        .single();

    if (error) throw new Error(`Failed to save sales report: ${error.message}`);
    return data as unknown as SavedSalesReport;
};

// ─────────────────────────────────────────────────────────────────────────
// Fetch sales reports list
// ─────────────────────────────────────────────────────────────────────────
export const fetchSalesReportHistory = async (
    businessId: string,
    page = 1,
    limit = 10
): Promise<{ reports: SavedSalesReport[]; total: number; totalPages: number }> => {
    const supabase = createClient();
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
        .from('sales_reports')
        .select('*', { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

    if (error) throw new Error(`Failed to fetch sales reports: ${error.message}`);
    const total = count ?? 0;
    return { reports: (data ?? []) as unknown as SavedSalesReport[], total, totalPages: Math.ceil(total / limit) };
};

// ─────────────────────────────────────────────────────────────────────────
// Fetch single sales report by ID
// ─────────────────────────────────────────────────────────────────────────
export const fetchSalesReportById = async (reportId: string): Promise<SavedSalesReport> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('sales_reports')
        .select('*')
        .eq('id', reportId)
        .single();

    if (error) throw new Error(`Failed to fetch sales report: ${error.message}`);
    return data as unknown as SavedSalesReport;
};

// ─────────────────────────────────────────────────────────────────────────
// Delete sales report
// ─────────────────────────────────────────────────────────────────────────
export const deleteSalesReport = async (reportId: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.from('sales_reports').delete().eq('id', reportId);
    if (error) throw new Error(`Failed to delete sales report: ${error.message}`);
};

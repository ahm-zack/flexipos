/**
 * EOD Report Service – Supabase client-side (no API routes)
 * All data fetching and computation runs in the browser using Supabase JS client.
 */

import { createClient } from '@/utils/supabase/client';
import { computeMetrics } from './compute';
import { parseDecimal } from './compute';
import type {
    RawOrder,
    SavedEODReport,
    SmartEODPreview,
} from './types';

// ─────────────────────────────────────────────────────────────────────────
// Generate EOD report number
// ─────────────────────────────────────────────────────────────────────────
const generateReportNumber = (existingCount: number): string => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(existingCount + 1).padStart(3, '0');
    return `EOD-${date}-${seq}`;
};

// ─────────────────────────────────────────────────────────────────────────
// Fetch the last EOD report for a business
// ─────────────────────────────────────────────────────────────────────────
export const fetchLastEODReport = async (
    businessId: string
): Promise<SavedEODReport | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('eod_reports')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch last EOD report: ${error.message}`);
    return data as SavedEODReport | null;
};

// ─────────────────────────────────────────────────────────────────────────
// Fetch orders after the last EOD cutoff (smart range)
// ─────────────────────────────────────────────────────────────────────────
const fetchPendingOrders = async (
    businessId: string,
    afterOrderId: string | null,
    afterTime: string | null
): Promise<RawOrder[]> => {
    const supabase = createClient();

    let query = supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .in('status', ['completed', 'modified'])
        .order('created_at', { ascending: true });

    // If we have a last EOD, only get orders after its period_end
    if (afterTime) {
        query = query.gt('created_at', afterTime);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    return (data ?? []) as unknown as RawOrder[];
};

// ─────────────────────────────────────────────────────────────────────────
// Get smart EOD preview (shows pending info BEFORE generating)
// ─────────────────────────────────────────────────────────────────────────
export const getSmartEODPreview = async (
    businessId: string
): Promise<SmartEODPreview> => {
    const lastReport = await fetchLastEODReport(businessId);

    const afterTime = lastReport?.period_end ?? null;
    const pendingOrders = await fetchPendingOrders(businessId, lastReport?.to_order_id ?? null, afterTime);

    if (pendingOrders.length === 0) {
        return {
            hasLastReport: !!lastReport,
            lastReportDate: lastReport ? new Date(lastReport.period_end) : null,
            lastReportNumber: lastReport?.report_number ?? null,
            lastToOrderId: lastReport?.to_order_id ?? null,
            pendingOrdersCount: 0,
            pendingRevenue: 0,
            periodStart: null,
            periodEnd: null,
            firstOrderId: null,
            lastOrderId: null,
            canGenerate: false,
        };
    }

    const revenue = pendingOrders.reduce((s, o) => s + parseDecimal(o.total_amount), 0);

    return {
        hasLastReport: !!lastReport,
        lastReportDate: lastReport ? new Date(lastReport.period_end) : null,
        lastReportNumber: lastReport?.report_number ?? null,
        lastToOrderId: lastReport?.to_order_id ?? null,
        pendingOrdersCount: pendingOrders.length,
        pendingRevenue: Math.round(revenue * 100) / 100,
        periodStart: new Date(pendingOrders[0].created_at),
        periodEnd: new Date(pendingOrders[pendingOrders.length - 1].created_at),
        firstOrderId: pendingOrders[0].id,
        lastOrderId: pendingOrders[pendingOrders.length - 1].id,
        canGenerate: true,
    };
};

// ─────────────────────────────────────────────────────────────────────────
// Generate + save an EOD report
// ─────────────────────────────────────────────────────────────────────────
export const generateAndSaveEODReport = async (
    businessId: string,
    generatedBy: string,
    notes?: string
): Promise<SavedEODReport> => {
    const supabase = createClient();
    const lastReport = await fetchLastEODReport(businessId);

    const afterTime = lastReport?.period_end ?? null;
    const pendingOrders = await fetchPendingOrders(businessId, lastReport?.to_order_id ?? null, afterTime);

    if (pendingOrders.length === 0) {
        throw new Error('No new orders to include in EOD report. All orders are already covered by the last report.');
    }

    // Count cancelled orders in the same window
    let cancelledCount = 0;
    {
        let cancelQuery = supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .eq('status', 'canceled');
        if (afterTime) cancelQuery = cancelQuery.gt('created_at', afterTime);
        const { count } = await cancelQuery;
        cancelledCount = count ?? 0;
    }

    const metrics = computeMetrics(pendingOrders, cancelledCount);

    // Generate report number
    const { count: existingCount } = await supabase
        .from('eod_reports')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId);
    const reportNumber = generateReportNumber(existingCount ?? 0);

    const toSave = {
        business_id: businessId,
        report_number: reportNumber,
        from_order_id: pendingOrders[0].id,
        to_order_id: pendingOrders[pendingOrders.length - 1].id,
        period_start: pendingOrders[0].created_at,
        period_end: pendingOrders[pendingOrders.length - 1].created_at,
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
        cash_received: metrics.cashReceived.toString(),
        change_given: metrics.changeGiven.toString(),
        average_order_value: metrics.averageOrderValue.toString(),
        payment_breakdown: metrics.paymentBreakdown,
        top_items: metrics.topItems,
        category_breakdown: metrics.categoryBreakdown,
        hourly_sales: metrics.hourlySales,
        generated_by: generatedBy,
        report_type: 'eod' as const,
        notes: notes ?? null,
    };

    const { data, error } = await supabase
        .from('eod_reports')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(toSave as any)
        .select('*')
        .single();

    if (error) throw new Error(`Failed to save EOD report: ${error.message}`);
    return data as unknown as SavedEODReport;
};

// ─────────────────────────────────────────────────────────────────────────
// Fetch EOD report list with pagination
// ─────────────────────────────────────────────────────────────────────────
export const fetchEODReportHistory = async (
    businessId: string,
    page = 1,
    limit = 10
): Promise<{ reports: SavedEODReport[]; total: number; totalPages: number }> => {
    const supabase = createClient();
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
        .from('eod_reports')
        .select('*', { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

    if (error) throw new Error(`Failed to fetch EOD report history: ${error.message}`);

    const total = count ?? 0;
    return {
        reports: (data ?? []) as unknown as SavedEODReport[],
        total,
        totalPages: Math.ceil(total / limit),
    };
};

// ─────────────────────────────────────────────────────────────────────────
// Fetch single EOD report by ID
// ─────────────────────────────────────────────────────────────────────────
export const fetchEODReportById = async (
    reportId: string
): Promise<SavedEODReport> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('eod_reports')
        .select('*')
        .eq('id', reportId)
        .single();

    if (error) throw new Error(`Failed to fetch EOD report: ${error.message}`);
    return data as unknown as SavedEODReport;
};

// ─────────────────────────────────────────────────────────────────────────
// Delete EOD report
// ─────────────────────────────────────────────────────────────────────────
export const deleteEODReport = async (reportId: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.from('eod_reports').delete().eq('id', reportId);
    if (error) throw new Error(`Failed to delete EOD report: ${error.message}`);
};

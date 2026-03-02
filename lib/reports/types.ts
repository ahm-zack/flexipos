/**
 * Shared types for EOD and Sales Report features
 * Generic/SaaS-ready – not restaurant-specific
 */

// ─────────────────────────────────────────────────────────────────────────────
// Raw order shape returned from Supabase
// ─────────────────────────────────────────────────────────────────────────────
export interface RawOrder {
    id: string;
    business_id: string;
    order_number: string;
    customer_name: string | null;
    items: OrderItem[];
    total_amount: string;
    payment_method: 'cash' | 'card' | 'mixed' | 'delivery';
    delivery_platform?: 'keeta' | 'hunger_station' | 'jahez' | null;
    status: 'completed' | 'canceled' | 'modified';
    discount_amount?: string | null;
    event_discount_amount?: string | null;
    cash_amount?: string | null;
    card_amount?: string | null;
    cash_received?: string | null;
    change_amount?: string | null;
    created_at: string;
    created_by: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Order item (from Supabase jsonb `items` field)
// ─────────────────────────────────────────────────────────────────────────────
export interface OrderItem {
    id: string;
    name?: string;
    nameEn?: string;
    nameAr?: string;
    quantity: number;
    price: number;
    totalPrice?: number;
    categoryId?: string;
    categoryName?: string;
    productId?: string;
    modifiers?: Array<{ id: string; name: string; price: number; type: string }>;
    [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Computed report metrics (shared by both EOD and Sales)
// ─────────────────────────────────────────────────────────────────────────────
export interface PaymentBreakdownItem {
    method: 'cash' | 'card' | 'delivery' | 'mixed';
    orderCount: number;
    totalAmount: number;
    percentage: number;
}

export interface TopItem {
    name: string;
    quantity: number;
    revenue: number;
    categoryId?: string;
    categoryName?: string;
}

export interface CategoryBreakdownItem {
    categoryId?: string;
    categoryName: string;
    itemCount: number;
    quantity: number;
    revenue: number;
}

export interface HourlySalesItem {
    hour: number;
    label: string; // '09:00', '14:00', etc.
    orderCount: number;
    revenue: number;
}

export interface DailySalesItem {
    date: string; // YYYY-MM-DD
    orderCount: number;
    revenue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core computed metrics (re-used for both report types)
// ─────────────────────────────────────────────────────────────────────────────
export interface ReportMetrics {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    totalVat: number;
    revenueExVat: number;
    cashRevenue: number;
    cardRevenue: number;
    deliveryRevenue: number;
    cashReceived: number;
    changeGiven: number;
    averageOrderValue: number;
    paymentBreakdown: PaymentBreakdownItem[];
    topItems: TopItem[];
    categoryBreakdown: CategoryBreakdownItem[];
    hourlySales: HourlySalesItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// EOD Report types
// ─────────────────────────────────────────────────────────────────────────────
export interface EODReportData extends ReportMetrics {
    businessId: string;
    reportNumber: string;
    fromOrderId: string | null;
    toOrderId: string | null;
    periodStart: Date;
    periodEnd: Date;
    generatedBy: string;
    reportType: 'eod';
    notes?: string;
}

// Saved EOD report as returned from Supabase (snake_case)
export interface SavedEODReport {
    id: string;
    business_id: string;
    report_number: string;
    from_order_id: string | null;
    to_order_id: string | null;
    period_start: string;
    period_end: string;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_revenue: string;
    total_discount: string;
    total_vat: string;
    revenue_ex_vat: string;
    cash_revenue: string;
    card_revenue: string;
    delivery_revenue: string;
    cash_received: string;
    change_given: string;
    average_order_value: string;
    payment_breakdown: PaymentBreakdownItem[];
    top_items: TopItem[];
    category_breakdown: CategoryBreakdownItem[];
    hourly_sales: HourlySalesItem[];
    generated_by: string;
    report_type: 'eod' | 'sales' | 'weekly' | 'monthly';
    notes: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sales Report types
// ─────────────────────────────────────────────────────────────────────────────
export interface SalesReportData extends ReportMetrics {
    businessId: string;
    reportName?: string;
    periodStart: Date;
    periodEnd: Date;
    generatedBy: string;
    dailySales: DailySalesItem[];
}

// Saved sales report as returned from Supabase (snake_case)
export interface SavedSalesReport {
    id: string;
    business_id: string;
    report_name: string | null;
    period_start: string;
    period_end: string;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_revenue: string;
    total_discount: string;
    total_vat: string;
    revenue_ex_vat: string;
    cash_revenue: string;
    card_revenue: string;
    delivery_revenue: string;
    average_order_value: string;
    payment_breakdown: PaymentBreakdownItem[];
    top_items: TopItem[];
    category_breakdown: CategoryBreakdownItem[];
    daily_sales: DailySalesItem[];
    hourly_sales: HourlySalesItem[];
    generated_by: string;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart EOD preview (shown before generating)
// ─────────────────────────────────────────────────────────────────────────────
export interface SmartEODPreview {
    hasLastReport: boolean;
    lastReportDate: Date | null;
    lastReportNumber: string | null;
    lastToOrderId: string | null;
    pendingOrdersCount: number;
    pendingRevenue: number;
    periodStart: Date | null;    // first pending order's createdAt
    periodEnd: Date | null;      // last pending order's createdAt
    firstOrderId: string | null;
    lastOrderId: string | null;
    canGenerate: boolean;        // true if pendingOrdersCount > 0
}

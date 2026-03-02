/**
 * Core report computation functions (pure, framework-agnostic)
 * Used by both EOD and Sales report services
 */

import { VAT_CONFIG } from '@/lib/vat-config';
import type {
    RawOrder,
    OrderItem,
    ReportMetrics,
    PaymentBreakdownItem,
    TopItem,
    CategoryBreakdownItem,
    HourlySalesItem,
    DailySalesItem,
} from './types';

const round2 = (n: number) => Math.round(n * 100) / 100;

// ─────────────────────────────────────────────────────────────────────────
// Parse helpers
// ─────────────────────────────────────────────────────────────────────────
const parseDecimal = (v: string | number | null | undefined) =>
    parseFloat((v ?? '0').toString()) || 0;

const parseItems = (items: unknown): OrderItem[] => {
    if (Array.isArray(items)) return items as OrderItem[];
    if (typeof items === 'string') {
        try { return JSON.parse(items) as OrderItem[]; } catch { return []; }
    }
    return [];
};

// ─────────────────────────────────────────────────────────────────────────
// Revenue totals
// ─────────────────────────────────────────────────────────────────────────
const calcRevenue = (orders: RawOrder[]) =>
    round2(orders.reduce((sum, o) => sum + parseDecimal(o.total_amount), 0));

const calcDiscount = (orders: RawOrder[]) =>
    round2(
        orders.reduce(
            (sum, o) =>
                sum + parseDecimal(o.discount_amount) + parseDecimal(o.event_discount_amount),
            0
        )
    );

// ─────────────────────────────────────────────────────────────────────────
// Payment break-down
// ─────────────────────────────────────────────────────────────────────────
const calcPaymentBreakdown = (orders: RawOrder[], totalRevenue: number): PaymentBreakdownItem[] => {
    const map: Record<string, { amount: number; count: number }> = {
        cash: { amount: 0, count: 0 },
        card: { amount: 0, count: 0 },
        delivery: { amount: 0, count: 0 },
    };

    let _cashReceived = 0;
    let _changeGiven = 0;
    let _cashRevenue = 0;
    let _cardRevenue = 0;
    let _deliveryRevenue = 0;

    orders.forEach((o) => {
        const amount = parseDecimal(o.total_amount);
        const cashAmt = parseDecimal(o.cash_amount);
        const cardAmt = parseDecimal(o.card_amount);
        const received = parseDecimal(o.cash_received);
        const change = parseDecimal(o.change_amount);

        switch (o.payment_method) {
            case 'cash':
                map.cash.amount += amount;
                map.cash.count += 1;
                _cashRevenue += amount;
                _cashReceived += received;
                _changeGiven += change;
                break;
            case 'card':
                map.card.amount += amount;
                map.card.count += 1;
                _cardRevenue += amount;
                break;
            case 'delivery':
                map.delivery.amount += amount;
                map.delivery.count += 1;
                _deliveryRevenue += amount;
                break;
            case 'mixed':
                if (cashAmt > 0) { map.cash.amount += cashAmt; map.cash.count += 1; _cashRevenue += cashAmt; }
                if (cardAmt > 0) { map.card.amount += cardAmt; map.card.count += 1; _cardRevenue += cardAmt; }
                _cashReceived += received;
                _changeGiven += change;
                break;
        }
    });

    return (['cash', 'card', 'delivery'] as const)
        .map((method) => ({
            method,
            orderCount: map[method].count,
            totalAmount: round2(map[method].amount),
            percentage: totalRevenue > 0 ? round2((map[method].amount / totalRevenue) * 100) : 0,
        }))
        .filter((item) => item.totalAmount > 0);
};

const calcPaymentTotals = (orders: RawOrder[]) => {
    let cashRevenue = 0, cardRevenue = 0, deliveryRevenue = 0;
    let cashReceived = 0, changeGiven = 0;

    orders.forEach((o) => {
        const amount = parseDecimal(o.total_amount);
        const cashAmt = parseDecimal(o.cash_amount);
        const cardAmt = parseDecimal(o.card_amount);
        const received = parseDecimal(o.cash_received);
        const change = parseDecimal(o.change_amount);

        switch (o.payment_method) {
            case 'cash':
                cashRevenue += amount; cashReceived += received; changeGiven += change; break;
            case 'card':
                cardRevenue += amount; break;
            case 'delivery':
                deliveryRevenue += amount; break;
            case 'mixed':
                cashRevenue += cashAmt; cardRevenue += cardAmt;
                cashReceived += received; changeGiven += change; break;
        }
    });

    return {
        cashRevenue: round2(cashRevenue),
        cardRevenue: round2(cardRevenue),
        deliveryRevenue: round2(deliveryRevenue),
        cashReceived: round2(cashReceived),
        changeGiven: round2(changeGiven),
    };
};

// ─────────────────────────────────────────────────────────────────────────
// Top items (aggregated by product name + categoryId)
// ─────────────────────────────────────────────────────────────────────────
const calcTopItems = (orders: RawOrder[], limit = 50): TopItem[] => {
    const map: Record<string, TopItem> = {};

    orders.forEach((o) => {
        const items = parseItems(o.items);
        items.forEach((item) => {
            const name = item.name || item.nameEn || item.nameAr || 'Unknown';
            const key = `${name}__${item.categoryId ?? ''}`;
            if (!map[key]) {
                map[key] = {
                    name,
                    quantity: 0,
                    revenue: 0,
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                };
            }
            map[key].quantity += item.quantity || 1;
            map[key].revenue += item.totalPrice ?? (item.price ?? 0) * (item.quantity || 1);
        });
    });

    return Object.values(map)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit)
        .map((i) => ({ ...i, revenue: round2(i.revenue) }));
};

// ─────────────────────────────────────────────────────────────────────────
// Category breakdown
// ─────────────────────────────────────────────────────────────────────────
const calcCategoryBreakdown = (orders: RawOrder[]): CategoryBreakdownItem[] => {
    const map: Record<string, CategoryBreakdownItem> = {};

    orders.forEach((o) => {
        const items = parseItems(o.items);
        items.forEach((item) => {
            const catId = item.categoryId ?? 'uncategorized';
            const catName = item.categoryName ?? 'Uncategorized';
            if (!map[catId]) {
                map[catId] = { categoryId: catId, categoryName: catName, itemCount: 0, quantity: 0, revenue: 0 };
            }
            map[catId].itemCount += 1;
            map[catId].quantity += item.quantity || 1;
            map[catId].revenue += item.totalPrice ?? (item.price ?? 0) * (item.quantity || 1);
        });
    });

    return Object.values(map)
        .sort((a, b) => b.revenue - a.revenue)
        .map((c) => ({ ...c, revenue: round2(c.revenue) }));
};

// ─────────────────────────────────────────────────────────────────────────
// Hourly sales
// ─────────────────────────────────────────────────────────────────────────
const calcHourlySales = (orders: RawOrder[]): HourlySalesItem[] => {
    const hours: Record<number, { orderCount: number; revenue: number }> = {};
    for (let h = 0; h < 24; h++) hours[h] = { orderCount: 0, revenue: 0 };

    orders.forEach((o) => {
        const h = new Date(o.created_at).getHours();
        hours[h].orderCount += 1;
        hours[h].revenue += parseDecimal(o.total_amount);
    });

    return Object.entries(hours).map(([h, data]) => ({
        hour: parseInt(h),
        label: `${parseInt(h).toString().padStart(2, '0')}:00`,
        orderCount: data.orderCount,
        revenue: round2(data.revenue),
    }));
};

// ─────────────────────────────────────────────────────────────────────────
// Daily sales (for sales reports)
// ─────────────────────────────────────────────────────────────────────────
export const calcDailySales = (orders: RawOrder[]): DailySalesItem[] => {
    const map: Record<string, { orderCount: number; revenue: number }> = {};

    orders.forEach((o) => {
        const date = o.created_at.slice(0, 10); // YYYY-MM-DD
        if (!map[date]) map[date] = { orderCount: 0, revenue: 0 };
        map[date].orderCount += 1;
        map[date].revenue += parseDecimal(o.total_amount);
    });

    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, orderCount: data.orderCount, revenue: round2(data.revenue) }));
};

// ─────────────────────────────────────────────────────────────────────────
// Main compute function – produces ReportMetrics from orders[]
// ─────────────────────────────────────────────────────────────────────────
export const computeMetrics = (completedOrders: RawOrder[], cancelledCount = 0): ReportMetrics => {
    const totalRevenue = calcRevenue(completedOrders);
    const totalDiscount = calcDiscount(completedOrders);

    // VAT (respects config)
    const vatAmount = VAT_CONFIG.includeVATInCalculations
        ? round2((totalRevenue * VAT_CONFIG.vatRate) / (1 + VAT_CONFIG.vatRate))
        : 0;
    const revenueExVat = round2(totalRevenue - vatAmount);

    const { cashRevenue, cardRevenue, deliveryRevenue, cashReceived, changeGiven } =
        calcPaymentTotals(completedOrders);

    const paymentBreakdown = calcPaymentBreakdown(completedOrders, totalRevenue);
    const topItems = calcTopItems(completedOrders);
    const categoryBreakdown = calcCategoryBreakdown(completedOrders);
    const hourlySales = calcHourlySales(completedOrders);

    const averageOrderValue =
        completedOrders.length > 0 ? round2(totalRevenue / completedOrders.length) : 0;

    return {
        totalOrders: completedOrders.length + cancelledCount,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledCount,
        totalRevenue,
        totalDiscount,
        totalVat: vatAmount,
        revenueExVat,
        cashRevenue,
        cardRevenue,
        deliveryRevenue,
        cashReceived,
        changeGiven,
        averageOrderValue,
        paymentBreakdown,
        topItems,
        categoryBreakdown,
        hourlySales,
    };
};

// Export helpers for use in service layers
export { parseDecimal, parseItems, round2 };

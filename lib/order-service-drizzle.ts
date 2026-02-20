/**
 * Server-side order service using Drizzle ORM
 * All operations are scoped to a businessId (SaaS multi-tenant)
 */

import { db, orders, canceledOrders, modifiedOrders, users } from '@/lib/db';
import { eq, and, gte, lte, ilike, desc, count, sql } from 'drizzle-orm';
import type {
    Order,
    NewOrder,
    OrderStatus,
    PaymentMethod,
    CanceledOrder,
    ModifiedOrder,
} from '@/lib/db/schema';
import { generateOrderNumber } from '@/lib/orders/server-utils';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface OrderFilters {
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    customerName?: string;
    orderNumber?: string;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface OrderWithCashier extends Order {
    cashierName?: string | null;
}

export interface OrdersListResult {
    orders: OrderWithCashier[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// ─── LIST ORDERS ──────────────────────────────────────────────────────────────

export async function getOrders(
    businessId: string,
    filters: OrderFilters = {},
    page = 1,
    limit = 10
): Promise<ApiResponse<OrdersListResult>> {
    try {
        const conditions = [eq(orders.businessId, businessId)];

        if (filters.status) conditions.push(eq(orders.status, filters.status));
        if (filters.paymentMethod) conditions.push(eq(orders.paymentMethod, filters.paymentMethod));
        if (filters.createdBy) conditions.push(eq(orders.createdBy, filters.createdBy));
        if (filters.customerName)
            conditions.push(ilike(orders.customerName, `%${filters.customerName}%`));
        if (filters.orderNumber)
            conditions.push(ilike(orders.orderNumber, `%${filters.orderNumber}%`));
        if (filters.dateFrom)
            conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
        if (filters.dateTo)
            conditions.push(lte(orders.createdAt, new Date(filters.dateTo)));

        const where = and(...conditions);
        const offset = (page - 1) * limit;

        // Run both queries in parallel
        const [rows, [{ total }]] = await Promise.all([
            db
                .select({
                    order: orders,
                    cashierName: users.fullName,
                })
                .from(orders)
                .leftJoin(users, eq(orders.createdBy, users.id))
                .where(where)
                .orderBy(desc(orders.createdAt))
                .limit(limit)
                .offset(offset),

            db.select({ total: count() }).from(orders).where(where),
        ]);

        const result: OrderWithCashier[] = rows.map(({ order, cashierName }) => ({
            ...order,
            cashierName,
        }));

        return {
            success: true,
            data: {
                orders: result,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / limit),
                currentPage: page,
            },
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────

export async function getOrderById(
    id: string,
    businessId: string
): Promise<ApiResponse<OrderWithCashier>> {
    try {
        const [row] = await db
            .select({ order: orders, cashierName: users.fullName })
            .from(orders)
            .leftJoin(users, eq(orders.createdBy, users.id))
            .where(and(eq(orders.id, id), eq(orders.businessId, businessId)));

        if (!row) {
            return { success: false, error: 'Order not found' };
        }

        return { success: true, data: { ...row.order, cashierName: row.cashierName } };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { success: false, error: 'Failed to fetch order' };
    }
}

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────

export interface CreateOrderInput {
    customerName?: string;
    items: unknown;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    deliveryPlatform?: 'keeta' | 'hunger_station' | 'jahez';
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
    eventDiscountName?: string;
    eventDiscountPercentage?: number;
    eventDiscountAmount?: number;
    cashAmount?: number;
    cardAmount?: number;
    cashReceived?: number;
    changeAmount?: number;
    createdBy: string;
}

export async function createOrder(
    businessId: string,
    input: CreateOrderInput
): Promise<ApiResponse<Order>> {
    try {
        const orderNumber = await generateOrderNumber();

        // Generate daily serial
        const today = new Date();
        const serialDate = today.toISOString().split('T')[0];

        const [{ dailyCount }] = await db
            .select({ dailyCount: count() })
            .from(orders)
            .where(
                and(
                    eq(orders.businessId, businessId),
                    sql`DATE(${orders.createdAt}) = CURRENT_DATE`
                )
            );

        const dailySerial = String(Number(dailyCount) + 1).padStart(3, '0');

        const newOrder: NewOrder = {
            businessId,
            orderNumber,
            dailySerial,
            serialDate,
            customerName: input.customerName ?? null,
            items: input.items,
            totalAmount: String(input.totalAmount),
            paymentMethod: input.paymentMethod,
            deliveryPlatform: input.deliveryPlatform ?? null,
            status: 'completed',
            discountType: input.discountType ?? null,
            discountValue: input.discountValue != null ? String(input.discountValue) : null,
            discountAmount: input.discountAmount != null ? String(input.discountAmount) : '0',
            eventDiscountName: input.eventDiscountName ?? null,
            eventDiscountPercentage:
                input.eventDiscountPercentage != null ? String(input.eventDiscountPercentage) : null,
            eventDiscountAmount:
                input.eventDiscountAmount != null ? String(input.eventDiscountAmount) : '0',
            cashAmount: input.cashAmount != null ? String(input.cashAmount) : null,
            cardAmount: input.cardAmount != null ? String(input.cardAmount) : null,
            cashReceived: input.cashReceived != null ? String(input.cashReceived) : null,
            changeAmount: input.changeAmount != null ? String(input.changeAmount) : null,
            createdBy: input.createdBy,
        };

        const [created] = await db.insert(orders).values(newOrder).returning();

        return { success: true, data: created };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: 'Failed to create order' };
    }
}

// ─── UPDATE ORDER ─────────────────────────────────────────────────────────────

export interface UpdateOrderInput {
    customerName?: string;
    items?: unknown;
    totalAmount?: number;
    paymentMethod?: PaymentMethod;
    deliveryPlatform?: 'keeta' | 'hunger_station' | 'jahez' | null;
    discountType?: string | null;
    discountValue?: number | null;
    discountAmount?: number | null;
    eventDiscountName?: string | null;
    eventDiscountPercentage?: number | null;
    eventDiscountAmount?: number | null;
    cashAmount?: number | null;
    cardAmount?: number | null;
    cashReceived?: number | null;
    changeAmount?: number | null;
    modifiedBy: string;
    modificationType?: 'item_added' | 'item_removed' | 'quantity_changed' | 'item_replaced' | 'multiple_changes';
}

export async function updateOrder(
    id: string,
    businessId: string,
    input: UpdateOrderInput
): Promise<ApiResponse<Order>> {
    try {
        // Fetch current order for audit trail
        const existingResult = await getOrderById(id, businessId);
        if (!existingResult.success || !existingResult.data) {
            return { success: false, error: 'Order not found' };
        }

        const existing = existingResult.data;

        // Build update payload (only defined fields)
        const patch: Partial<NewOrder> = { updatedAt: new Date() };
        if (input.customerName !== undefined) patch.customerName = input.customerName;
        if (input.items !== undefined) patch.items = input.items;
        if (input.totalAmount !== undefined) patch.totalAmount = String(input.totalAmount);
        if (input.paymentMethod !== undefined) patch.paymentMethod = input.paymentMethod;
        if (input.deliveryPlatform !== undefined) patch.deliveryPlatform = input.deliveryPlatform;
        if (input.discountType !== undefined) patch.discountType = input.discountType;
        if (input.discountValue !== undefined)
            patch.discountValue = input.discountValue != null ? String(input.discountValue) : null;
        if (input.discountAmount !== undefined)
            patch.discountAmount = input.discountAmount != null ? String(input.discountAmount) : '0';
        if (input.eventDiscountName !== undefined) patch.eventDiscountName = input.eventDiscountName;
        if (input.eventDiscountPercentage !== undefined)
            patch.eventDiscountPercentage =
                input.eventDiscountPercentage != null ? String(input.eventDiscountPercentage) : null;
        if (input.eventDiscountAmount !== undefined)
            patch.eventDiscountAmount =
                input.eventDiscountAmount != null ? String(input.eventDiscountAmount) : '0';
        if (input.cashAmount !== undefined)
            patch.cashAmount = input.cashAmount != null ? String(input.cashAmount) : null;
        if (input.cardAmount !== undefined)
            patch.cardAmount = input.cardAmount != null ? String(input.cardAmount) : null;
        if (input.cashReceived !== undefined)
            patch.cashReceived = input.cashReceived != null ? String(input.cashReceived) : null;
        if (input.changeAmount !== undefined)
            patch.changeAmount = input.changeAmount != null ? String(input.changeAmount) : null;

        const [updated] = await db
            .update(orders)
            .set(patch)
            .where(and(eq(orders.id, id), eq(orders.businessId, businessId)))
            .returning();

        if (!updated) return { success: false, error: 'Order not found' };

        // Write audit log
        const modificationType = input.modificationType ?? 'multiple_changes';
        await db.insert(modifiedOrders).values({
            businessId,
            originalOrderId: id,
            modifiedBy: input.modifiedBy,
            modificationType,
            originalData: existing as unknown as Record<string, unknown>,
            newData: updated as unknown as Record<string, unknown>,
        });

        // Mark order as modified
        await db
            .update(orders)
            .set({ status: 'modified' })
            .where(and(eq(orders.id, id), eq(orders.businessId, businessId)));

        return { success: true, data: { ...updated, status: 'modified' } };
    } catch (error) {
        console.error('Error updating order:', error);
        return { success: false, error: 'Failed to update order' };
    }
}

// ─── CANCEL ORDER ─────────────────────────────────────────────────────────────

export async function cancelOrder(
    id: string,
    businessId: string,
    canceledBy: string,
    reason?: string
): Promise<ApiResponse<CanceledOrder>> {
    try {
        const existingResult = await getOrderById(id, businessId);
        if (!existingResult.success || !existingResult.data) {
            return { success: false, error: 'Order not found' };
        }

        const existing = existingResult.data;

        if (existing.status === 'canceled') {
            return { success: false, error: 'Order is already canceled' };
        }

        // Mark order as canceled
        await db
            .update(orders)
            .set({ status: 'canceled', updatedAt: new Date() })
            .where(and(eq(orders.id, id), eq(orders.businessId, businessId)));

        // Write audit record
        const [cancelRecord] = await db
            .insert(canceledOrders)
            .values({
                businessId,
                originalOrderId: id,
                canceledBy,
                reason: reason ?? null,
                orderData: existing as unknown as Record<string, unknown>,
            })
            .returning();

        return { success: true, data: cancelRecord };
    } catch (error) {
        console.error('Error canceling order:', error);
        return { success: false, error: 'Failed to cancel order' };
    }
}

// ─── GET CANCELED ORDERS ──────────────────────────────────────────────────────

export async function getCanceledOrders(
    businessId: string
): Promise<ApiResponse<CanceledOrder[]>> {
    try {
        const rows = await db
            .select()
            .from(canceledOrders)
            .where(eq(canceledOrders.businessId, businessId))
            .orderBy(desc(canceledOrders.canceledAt));

        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching canceled orders:', error);
        return { success: false, error: 'Failed to fetch canceled orders' };
    }
}

// ─── GET MODIFIED ORDERS ──────────────────────────────────────────────────────

export async function getModifiedOrders(
    businessId: string
): Promise<ApiResponse<ModifiedOrder[]>> {
    try {
        const rows = await db
            .select()
            .from(modifiedOrders)
            .where(eq(modifiedOrders.businessId, businessId))
            .orderBy(desc(modifiedOrders.modifiedAt));

        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching modified orders:', error);
        return { success: false, error: 'Failed to fetch modified orders' };
    }
}

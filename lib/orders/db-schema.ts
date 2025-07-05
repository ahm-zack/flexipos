import { pgTable, text, timestamp, uuid, pgEnum, decimal, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../db/schema';

// Order status enum (using different name to avoid conflicts)
export const ordersStatusEnum = pgEnum('orders_status', ['completed', 'canceled', 'modified']);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'mixed']);

// Item type enum
export const itemTypeEnum = pgEnum('item_type', ['pizza', 'pie', 'sandwich', 'mini_pie']);

// Modification type enum
export const modificationTypeEnum = pgEnum('modification_type', [
  'item_added',
  'item_removed',
  'quantity_changed',
  'item_replaced',
  'multiple_changes'
]);

// Orders table - Main orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(), // Auto-generated unique order number
  customerName: text('customer_name'), // Optional customer name
  items: jsonb('items').notNull(), // Array of order items in JSON format
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'), // Payment method
  status: ordersStatusEnum('status').notNull().default('completed'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id), // Foreign key to users table
});

// Canceled orders table - Stores canceled orders with reference to original
export const canceledOrders = pgTable('canceled_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  originalOrderId: uuid('original_order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }).defaultNow().notNull(),
  canceledBy: uuid('canceled_by').notNull().references(() => users.id),
  reason: text('reason'), // Optional cancellation reason
  orderData: jsonb('order_data').notNull(), // Complete original order data as JSON
});

// Modified orders table - Stores order modifications with before/after data
export const modifiedOrders = pgTable('modified_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  originalOrderId: uuid('original_order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  modifiedAt: timestamp('modified_at', { withTimezone: true }).defaultNow().notNull(),
  modifiedBy: uuid('modified_by').notNull().references(() => users.id),
  modificationType: modificationTypeEnum('modification_type').notNull(),
  originalData: jsonb('original_data').notNull(), // Original order data before modification
  newData: jsonb('new_data').notNull(), // New order data after modification
});

// Export TypeScript types inferred from the schema
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus = typeof ordersStatusEnum.enumValues[number];
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number];
export type ItemType = typeof itemTypeEnum.enumValues[number];

export type CanceledOrder = typeof canceledOrders.$inferSelect;
export type NewCanceledOrder = typeof canceledOrders.$inferInsert;

export type ModifiedOrder = typeof modifiedOrders.$inferSelect;
export type NewModifiedOrder = typeof modifiedOrders.$inferInsert;
export type ModificationType = typeof modificationTypeEnum.enumValues[number];

// Helper type for order items structure (for TypeScript typing of JSON fields)
export interface OrderItem {
  id: string; // Item ID (pizza, pie, sandwich, etc.)
  type: ItemType; // Item type
  name: string; // Item name (English)
  nameAr: string; // Item name (Arabic)
  quantity: number; // Quantity ordered
  unitPrice: number; // Price per unit
  totalPrice: number; // Total price for this item
  details?: Record<string, unknown>; // Additional details (size, extras, etc.)
}

// Helper type for complete order structure
export interface OrderWithItems extends Omit<Order, 'items'> {
  items: OrderItem[];
}

// Helper type for order responses with user information
export interface OrderResponse extends OrderWithItems {
  cashierName?: string;
}

// Indexes for better query performance
// Note: These would be created in the migration files
export const orderIndexes = {
  ordersByStatus: 'idx_orders_status',
  ordersByCreatedBy: 'idx_orders_created_by',
  ordersByCreatedAt: 'idx_orders_created_at',
  ordersByOrderNumber: 'idx_orders_order_number',
  canceledOrdersByOriginalId: 'idx_canceled_orders_original_order_id',
  modifiedOrdersByOriginalId: 'idx_modified_orders_original_order_id',
};

import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';
import { users } from '../db/schema';

// Customers table - Stores customer information and purchase aggregation
export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: text('phone').notNull().unique(), // Phone number as unique identifier
    name: text('name').notNull(), // Customer name
    address: text('address'), // Customer address (optional)
    totalPurchases: decimal('total_purchases', { precision: 12, scale: 2 }).notNull().default('0'), // Total amount spent
    orderCount: decimal('order_count', { precision: 10, scale: 0 }).notNull().default('0'), // Number of orders
    lastOrderAt: timestamp('last_order_at', { withTimezone: true }), // Last order timestamp
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id), // Who added this customer
});

// Customer orders junction table - Links customers to their orders
export const customerOrders = pgTable('customer_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    orderNumber: text('order_number').notNull(), // Reference to orders.orderNumber
    orderTotal: decimal('order_total', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export TypeScript types inferred from the schema
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type CustomerOrder = typeof customerOrders.$inferSelect;
export type NewCustomerOrder = typeof customerOrders.$inferInsert;

// Helper type for customer with aggregated data
export interface CustomerWithStats extends Customer {
    recentOrderNumbers?: string[]; // Recent order numbers for reference
}

// Helper type for customer search results
export interface CustomerSearchResult {
    id: string;
    phone: string;
    name: string;
    address?: string;
    totalPurchases: number;
    orderCount: number;
    lastOrderAt?: string;
}

// Indexes for better query performance
export const customerIndexes = {
    customersByPhone: 'idx_customers_phone',
    customersByName: 'idx_customers_name',
    customersByCreatedBy: 'idx_customers_created_by',
    customersByCreatedAt: 'idx_customers_created_at',
    customerOrdersByCustomerId: 'idx_customer_orders_customer_id',
    customerOrdersByOrderNumber: 'idx_customer_orders_order_number',
};

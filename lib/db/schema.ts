import { pgTable, text, timestamp, uuid, pgEnum, decimal, integer, jsonb, date, boolean, unique } from 'drizzle-orm/pg-core';

// ================================
// ENUMS
// ================================

// User role enum (superadmin only manually set in DB, not in UI)
export const roleEnum = pgEnum('role', ['superadmin', 'admin', 'manager', 'staff']);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['completed', 'canceled', 'modified']);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'mixed', 'delivery']);

// Delivery platform enum
export const deliveryPlatformEnum = pgEnum('delivery_platform', ['keeta', 'hunger_station', 'jahez']);

// Modification type enum
export const modificationTypeEnum = pgEnum('modification_type', [
  'item_added',
  'item_removed',
  'quantity_changed',
  'item_replaced',
  'multiple_changes'
]);

// ================================
// CORE TABLES
// ================================

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  role: text('role').default('user'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof roleEnum.enumValues[number];

// Businesses table
export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  logoUrl: text('logo_url'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  timezone: text('timezone').default('UTC'),
  currency: text('currency').default('USD'),
  settings: jsonb('settings').default('{}'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

// Business Users (Multi-tenant relationship)
export const businessUsers = pgTable('business_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('cashier'),
  permissions: jsonb('permissions').default('{}'),
  isActive: boolean('is_active').default(true),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow(),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type BusinessUser = typeof businessUsers.$inferSelect;
export type NewBusinessUser = typeof businessUsers.$inferInsert;

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  icon: text('icon'),
  color: text('color').default('#3b82f6'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// Products table (universal product table for all businesses)
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  description: text('description'),
  sku: text('sku'),
  barcode: text('barcode'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).default('0'),
  images: text('images').array().default([]),
  variants: jsonb('variants').default('[]'),
  modifiers: jsonb('modifiers').default('[]'),
  tags: text('tags').array().default([]),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  stockQuantity: integer('stock_quantity').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// ================================
// ORDERS TABLES
// ================================

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull(),
  dailySerial: text('daily_serial'),
  serialDate: date('serial_date'),
  customerName: text('customer_name'),
  items: jsonb('items').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'),
  deliveryPlatform: deliveryPlatformEnum('delivery_platform'),
  status: orderStatusEnum('status').notNull().default('completed'),
  discountType: text('discount_type'),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  eventDiscountName: text('event_discount_name'),
  eventDiscountPercentage: decimal('event_discount_percentage', { precision: 5, scale: 2 }),
  eventDiscountAmount: decimal('event_discount_amount', { precision: 10, scale: 2 }).default('0'),
  cashAmount: decimal('cash_amount', { precision: 10, scale: 2 }),
  cardAmount: decimal('card_amount', { precision: 10, scale: 2 }),
  cashReceived: decimal('cash_received', { precision: 10, scale: 2 }),
  changeAmount: decimal('change_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus = typeof orderStatusEnum.enumValues[number];
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number];
export type DeliveryPlatform = typeof deliveryPlatformEnum.enumValues[number];

// Canceled Orders table (audit trail)
export const canceledOrders = pgTable('canceled_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  originalOrderId: uuid('original_order_id').notNull(),
  canceledAt: timestamp('canceled_at', { withTimezone: true }).defaultNow().notNull(),
  canceledBy: uuid('canceled_by').notNull().references(() => users.id),
  reason: text('reason'),
  orderData: jsonb('order_data').notNull(),
});

export type CanceledOrder = typeof canceledOrders.$inferSelect;
export type NewCanceledOrder = typeof canceledOrders.$inferInsert;

// Modified Orders table (audit trail)
export const modifiedOrders = pgTable('modified_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  originalOrderId: uuid('original_order_id').notNull(),
  modifiedAt: timestamp('modified_at', { withTimezone: true }).defaultNow().notNull(),
  modifiedBy: uuid('modified_by').notNull().references(() => users.id),
  modificationType: modificationTypeEnum('modification_type').notNull(),
  originalData: jsonb('original_data').notNull(),
  newData: jsonb('new_data').notNull(),
});

export type ModifiedOrder = typeof modifiedOrders.$inferSelect;
export type NewModifiedOrder = typeof modifiedOrders.$inferInsert;
export type ModificationType = typeof modificationTypeEnum.enumValues[number];

// Per-business order serial counter (increments from 1, never resets)
export const businessOrderCounters = pgTable('business_order_counters', {
  businessId: uuid('business_id').primaryKey().references(() => businesses.id, { onDelete: 'cascade' }),
  lastSerial: integer('last_serial').notNull().default(0),
});

export type BusinessOrderCounter = typeof businessOrderCounters.$inferSelect;

// ================================
// TYPE HELPERS
// ================================

export type Modifier = {
  id: string;
  type: 'extra' | 'without';
  name: string;
  price: number;
};

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Modifier[];
  [key: string]: unknown; // For any additional fields like category, productId, etc.
};

// ================================
// CUSTOMERS TABLE
// ================================

// Customers table – one customer record per business (multi-tenant: phone unique per business)
export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    address: text('address'),
    totalPurchases: decimal('total_purchases', { precision: 12, scale: 2 })
      .notNull()
      .default('0'),
    orderCount: integer('order_count').notNull().default(0),
    lastOrderAt: timestamp('last_order_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    uniquePhonePerBusiness: unique('customers_business_phone_unique').on(
      table.businessId,
      table.phone
    ),
  })
);

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

// ================================
// REPORTS TABLES
// ================================

// Report type enum
export const reportTypeEnum = pgEnum('report_type', ['eod', 'sales', 'weekly', 'monthly']);

// EOD Reports table (multi-tenant, generic for any business type)
export const eodReports = pgTable('eod_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  reportNumber: text('report_number').notNull(),
  // Smart order range tracking (for consecutive EOD reports)
  fromOrderId: uuid('from_order_id'),   // first order included (null = from beginning)
  toOrderId: uuid('to_order_id'),       // last order included (next EOD starts after this)
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  // Order counts
  totalOrders: integer('total_orders').notNull().default(0),
  completedOrders: integer('completed_orders').notNull().default(0),
  cancelledOrders: integer('cancelled_orders').notNull().default(0),
  // Revenue
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  totalDiscount: decimal('total_discount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalVat: decimal('total_vat', { precision: 12, scale: 2 }).notNull().default('0'),
  revenueExVat: decimal('revenue_ex_vat', { precision: 12, scale: 2 }).notNull().default('0'),
  // Payment breakdown
  cashRevenue: decimal('cash_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  cardRevenue: decimal('card_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  deliveryRevenue: decimal('delivery_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  cashReceived: decimal('cash_received', { precision: 12, scale: 2 }).notNull().default('0'),
  changeGiven: decimal('change_given', { precision: 12, scale: 2 }).notNull().default('0'),
  averageOrderValue: decimal('average_order_value', { precision: 12, scale: 2 }).notNull().default('0'),
  // JSON breakdowns (generic - works for any business type)
  paymentBreakdown: jsonb('payment_breakdown').notNull().default('[]'),
  topItems: jsonb('top_items').notNull().default('[]'),             // [{name, qty, revenue, categoryId?}]
  categoryBreakdown: jsonb('category_breakdown').notNull().default('[]'), // [{categoryName, qty, revenue}]
  hourlySales: jsonb('hourly_sales').notNull().default('[]'),      // [{hour, orderCount, revenue}]
  // Metadata
  generatedBy: uuid('generated_by').notNull().references(() => users.id),
  reportType: reportTypeEnum('report_type').notNull().default('eod'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type EODReport = typeof eodReports.$inferSelect;
export type NewEODReport = typeof eodReports.$inferInsert;

// Sales Reports table (custom date range, printable)
export const salesReports = pgTable('sales_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  reportName: text('report_name'),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  // Core metrics
  totalOrders: integer('total_orders').notNull().default(0),
  completedOrders: integer('completed_orders').notNull().default(0),
  cancelledOrders: integer('cancelled_orders').notNull().default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  totalDiscount: decimal('total_discount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalVat: decimal('total_vat', { precision: 12, scale: 2 }).notNull().default('0'),
  revenueExVat: decimal('revenue_ex_vat', { precision: 12, scale: 2 }).notNull().default('0'),
  cashRevenue: decimal('cash_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  cardRevenue: decimal('card_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  deliveryRevenue: decimal('delivery_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  averageOrderValue: decimal('average_order_value', { precision: 12, scale: 2 }).notNull().default('0'),
  // JSON breakdowns
  paymentBreakdown: jsonb('payment_breakdown').notNull().default('[]'),
  topItems: jsonb('top_items').notNull().default('[]'),
  categoryBreakdown: jsonb('category_breakdown').notNull().default('[]'),
  dailySales: jsonb('daily_sales').notNull().default('[]'),   // [{date, orderCount, revenue}]
  hourlySales: jsonb('hourly_sales').notNull().default('[]'),
  // Metadata
  generatedBy: uuid('generated_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SalesReport = typeof salesReports.$inferSelect;
export type NewSalesReport = typeof salesReports.$inferInsert;

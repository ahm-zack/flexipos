import { pgTable, text, timestamp, uuid, pgEnum, decimal, integer, jsonb, date, boolean } from 'drizzle-orm/pg-core';

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

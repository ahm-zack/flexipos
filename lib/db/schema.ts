import { pgTable, text, timestamp, uuid, pgEnum, decimal, integer, jsonb, date } from 'drizzle-orm/pg-core';

// Define role enum
export const roleEnum = pgEnum('role', ['superadmin', 'admin', 'manager', 'cashier', 'kitchen']);

// Define pizza type enum
export const pizzaTypeEnum = pgEnum('pizza_type', ['Margherita', 'Vegetable', 'Pepperoni', 'Mortadella', 'Chicken']);

// Define pizza crust enum
export const pizzaCrustEnum = pgEnum('pizza_crust', ['original', 'thin']);

// Define pizza extras enum
export const pizzaExtrasEnum = pgEnum('pizza_extras', ['cheese', 'vegetables', 'Pepperoni', 'Mortadella', 'Chicken']);

// Define pie type enum
export const pieTypeEnum = pgEnum('pie_type', [
  'Akkawi Cheese',
  'Halloumi Cheese',
  'Cream Cheese',
  'Zaatar',
  'Labneh & Vegetables',
  'Muhammara + Akkawi Cheese + Zaatar',
  'Akkawi Cheese + Zaatar',
  'Labneh + Zaatar',
  'Halloumi Cheese + Zaatar',
  'Sweet Cheese + Akkawi + Mozzarella'
]);

// Define pie size enum
export const pieSizeEnum = pgEnum('pie_size', ['small', 'medium', 'large']);

// Define sandwich type enum
export const sandwichTypeEnum = pgEnum('sandwich_type', [
  'Beef Sandwich with Cheese',
  'Chicken Sandwich with Cheese',
  'Muhammara Sandwich with Cheese'
]);

// Define sandwich size enum
export const sandwichSizeEnum = pgEnum('sandwich_size', ['small', 'medium', 'large']);

// Define mini pie type enum (Party Only)
export const miniPieTypeEnum = pgEnum('mini_pie_type', [
  'Mini Zaatar Pie',
  'Mini Cheese Pie',
  'Mini Spinach Pie',
  'Mini Meat Pie (Ba\'lakiya style)',
  'Mini Halloumi Cheese Pie',
  'Mini Hot Dog Pie',
  'Mini Pizza Pie'
]);

// Define mini pie size enum (typically small for party pies)
export const miniPieSizeEnum = pgEnum('mini_pie_size', ['small', 'medium', 'large']);



// Burger table schema
export const burgers = pgTable('burgers', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Beverage table schema
export const beverages = pgTable('beverages', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Side Order table schema
export const sideOrders = pgTable('side_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Appetizer table schema
export const appetizers = pgTable('appetizers', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Shawarma table schema
export const shawarmas = pgTable('shawarmas', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Burger = Omit<typeof burgers.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewBurger = Omit<typeof burgers.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };

export type Beverage = Omit<typeof beverages.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewBeverage = Omit<typeof beverages.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };

export type SideOrder = Omit<typeof sideOrders.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewSideOrder = Omit<typeof sideOrders.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };

export type Appetizer = Omit<typeof appetizers.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewAppetizer = Omit<typeof appetizers.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };

export type Shawarma = Omit<typeof shawarmas.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewShawarma = Omit<typeof shawarmas.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };

// Define modifier type enum for extras and withouts
export const modifierTypeEnum = pgEnum('modifier_type', ['extra', 'without']);

// Users table schema
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('cashier'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof roleEnum.enumValues[number];

// Pizza table schema
export const pizzas = pgTable('pizzas', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: pizzaTypeEnum('type').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  crust: pizzaCrustEnum('crust'),
  imageUrl: text('image_url').notNull(),
  extras: pizzaExtrasEnum('extras'),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Modifier type for use in item tables
export type Modifier = {
  id: string;
  type: 'extra' | 'without';
  name: string;
  price: number;
};

// Export pizza types
export type Pizza = Omit<typeof pizzas.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewPizza = Omit<typeof pizzas.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };
export type PizzaType = typeof pizzaTypeEnum.enumValues[number];
export type PizzaCrust = typeof pizzaCrustEnum.enumValues[number];
export type PizzaExtras = typeof pizzaExtrasEnum.enumValues[number];

// Pie table schema
export const pies = pgTable('pies', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: pieTypeEnum('type').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  size: pieSizeEnum('size').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Pie = Omit<typeof pies.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewPie = Omit<typeof pies.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };
export type PieType = typeof pieTypeEnum.enumValues[number];
export type PieSize = typeof pieSizeEnum.enumValues[number];

// Sandwich table schema
export const sandwiches = pgTable('sandwiches', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: sandwichTypeEnum('type').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  size: sandwichSizeEnum('size').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Sandwich = Omit<typeof sandwiches.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewSandwich = Omit<typeof sandwiches.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };
export type SandwichType = typeof sandwichTypeEnum.enumValues[number];
export type SandwichSize = typeof sandwichSizeEnum.enumValues[number];

// Mini Pie table schema
export const miniPies = pgTable('mini_pies', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: miniPieTypeEnum('type').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  size: miniPieSizeEnum('size').notNull(),
  imageUrl: text('image_url').notNull(),
  priceWithVat: decimal('price_with_vat', { precision: 10, scale: 2 }).notNull(),
  modifiers: jsonb('modifiers').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type MiniPie = Omit<typeof miniPies.$inferSelect, 'modifiers'> & { modifiers: Modifier[] };
export type NewMiniPie = Omit<typeof miniPies.$inferInsert, 'modifiers'> & { modifiers: Modifier[] };
export type MiniPieType = typeof miniPieTypeEnum.enumValues[number];
export type MiniPieSize = typeof miniPieSizeEnum.enumValues[number];

// Menu Item Modifiers table - stores extras and withouts for each menu item
export const menuItemModifiers = pgTable('menu_item_modifiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  menuItemId: uuid('menu_item_id').notNull(), // References menu items (pizzas, pies, sandwiches, mini_pies)
  menuItemType: text('menu_item_type').notNull(), // 'pizza', 'pie', 'sandwich', 'mini_pie'
  name: text('name').notNull(), // Name of the modifier (e.g., "Extra Cheese", "No Onions")
  type: modifierTypeEnum('type').notNull(), // 'extra' or 'without'
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'), // Price (0 for 'without' items)
  displayOrder: integer('display_order').notNull().default(0), // For drag-to-reorder functionality
  isActive: text('is_active').notNull().default('true'), // Using text for boolean (Drizzle compatibility)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Order Item Modifiers table - stores selected modifiers for order items
export const orderItemModifiers = pgTable('order_item_modifiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(), // References the order
  menuItemId: uuid('menu_item_id').notNull(), // Which menu item this modifier belongs to
  menuItemType: text('menu_item_type').notNull(), // 'pizza', 'pie', 'sandwich', 'mini_pie'
  modifierId: uuid('modifier_id').notNull().references(() => menuItemModifiers.id),
  modifierName: text('modifier_name').notNull(), // Store name for historical records
  modifierType: modifierTypeEnum('modifier_type').notNull(), // 'extra' or 'without'
  priceAtTime: decimal('price_at_time', { precision: 10, scale: 2 }).notNull(), // Price when order was made
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export modifier types
export type MenuItemModifier = typeof menuItemModifiers.$inferSelect;
export type NewMenuItemModifier = typeof menuItemModifiers.$inferInsert;
export type OrderItemModifier = typeof orderItemModifiers.$inferSelect;
export type NewOrderItemModifier = typeof orderItemModifiers.$inferInsert;
export type ModifierType = typeof modifierTypeEnum.enumValues[number];

// Define payment method enum for EOD reports
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'mixed', 'delivery']);

// Define delivery platform enum
export const deliveryPlatformEnum = pgEnum('delivery_platform', ['keeta', 'hunger_station', 'jahez']);

// Define order status enum for EOD reports
export const eodOrderStatusEnum = pgEnum('eod_order_status', ['confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

// Define report type enum
export const reportTypeEnum = pgEnum('report_type', ['daily', 'custom', 'weekly', 'monthly']);

// EOD Reports table schema
export const eodReports = pgTable('eod_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportNumber: text('report_number').unique(),
  reportDate: date('report_date').notNull(),
  startDateTime: timestamp('start_date_time', { withTimezone: true }).notNull(),
  endDateTime: timestamp('end_date_time', { withTimezone: true }).notNull(),

  // Core metrics
  totalOrders: integer('total_orders').notNull().default(0),
  completedOrders: integer('completed_orders').notNull().default(0),
  cancelledOrders: integer('cancelled_orders').notNull().default(0),

  // Financial metrics
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalWithVat: decimal('total_with_vat', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalWithoutVat: decimal('total_without_vat', { precision: 12, scale: 2 }).notNull().default('0.00'),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),

  // Payment method breakdown
  totalCashOrders: decimal('total_cash_orders', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalCardOrders: decimal('total_card_orders', { precision: 12, scale: 2 }).notNull().default('0.00'),
  cashOrdersCount: integer('cash_orders_count').notNull().default(0),
  cardOrdersCount: integer('card_orders_count').notNull().default(0),

  // Detailed cash flow tracking
  totalCashReceived: decimal('total_cash_received', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalChangeGiven: decimal('total_change_given', { precision: 12, scale: 2 }).notNull().default('0.00'),

  // Performance metrics
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }).notNull().default('0.00'),
  peakHour: text('peak_hour'),
  orderCompletionRate: decimal('order_completion_rate', { precision: 5, scale: 2 }).notNull().default('0.00'),
  orderCancellationRate: decimal('order_cancellation_rate', { precision: 5, scale: 2 }).notNull().default('0.00'),

  // Complex data stored as JSON
  paymentBreakdown: jsonb('payment_breakdown'), // PaymentBreakdown[]
  deliveryPlatformBreakdown: jsonb('delivery_platform_breakdown').default([]).notNull(), // DeliveryPlatformBreakdown[]
  bestSellingItems: jsonb('best_selling_items'), // BestSellingItem[]
  hourlySales: jsonb('hourly_sales'), // HourlySales[]

  // Metadata
  generatedBy: uuid('generated_by').references(() => users.id).notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
  reportType: reportTypeEnum('report_type').notNull().default('daily'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export EOD report types
export type EODReport = typeof eodReports.$inferSelect;
export type NewEODReport = typeof eodReports.$inferInsert;
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number];
export type EODOrderStatus = typeof eodOrderStatusEnum.enumValues[number];
export type ReportType = typeof reportTypeEnum.enumValues[number];

// Import and re-export orders tables
export {
  orders,
  canceledOrders,
  modifiedOrders,
  ordersStatusEnum,
  itemTypeEnum,
  modificationTypeEnum
} from '../orders/db-schema';

export type {
  Order,
  NewOrder,
  OrderStatus,
  ItemType,
  CanceledOrder,
  NewCanceledOrder,
  ModifiedOrder,
  NewModifiedOrder,
  ModificationType,
  OrderItem,
  OrderWithItems,
  OrderResponse
} from '../orders/db-schema';

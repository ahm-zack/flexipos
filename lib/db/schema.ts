import { pgTable, text, timestamp, uuid, pgEnum, decimal } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export pizza types
export type Pizza = typeof pizzas.$inferSelect;
export type NewPizza = typeof pizzas.$inferInsert;
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export pie types
export type Pie = typeof pies.$inferSelect;
export type NewPie = typeof pies.$inferInsert;
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Export sandwich types
export type Sandwich = typeof sandwiches.$inferSelect;
export type NewSandwich = typeof sandwiches.$inferInsert;
export type SandwichType = typeof sandwichTypeEnum.enumValues[number];
export type SandwichSize = typeof sandwichSizeEnum.enumValues[number];

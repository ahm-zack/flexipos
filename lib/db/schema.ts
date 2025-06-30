import { pgTable, text, timestamp, uuid, pgEnum, decimal } from 'drizzle-orm/pg-core';

// Define role enum
export const roleEnum = pgEnum('role', ['superadmin', 'admin', 'manager', 'cashier', 'kitchen']);

// Define pizza type enum
export const pizzaTypeEnum = pgEnum('pizza_type', ['Margherita', 'Vegetable', 'Pepperoni', 'Mortadella', 'Chicken']);

// Define pizza crust enum
export const pizzaCrustEnum = pgEnum('pizza_crust', ['original', 'thin']);

// Define pizza extras enum
export const pizzaExtrasEnum = pgEnum('pizza_extras', ['cheese', 'vegetables', 'Pepperoni', 'Mortadella', 'Chicken']);

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

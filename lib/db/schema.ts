import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

// Define role enum
export const roleEnum = pgEnum('role', ['superadmin', 'admin', 'manager', 'cashier', 'kitchen']);

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

import { z } from 'zod';

// Simple role enum
export const AppRoleEnum = z.enum(['superadmin', 'admin', 'manager', 'cashier', 'kitchen']);
export type AppRole = z.infer<typeof AppRoleEnum>;

// Simple User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: AppRoleEnum,
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Create user schema
export const CreateUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  role: AppRoleEnum,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

// Update user schema
export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: AppRoleEnum.optional(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Pizza enums
export const PizzaTypeEnum = z.enum(['Margherita', 'Vegetable', 'Pepperoni', 'Mortadella', 'Chicken']);
export const PizzaCrustEnum = z.enum(['original', 'thin']);
export const PizzaExtrasEnum = z.enum(['cheese', 'vegetables', 'Pepperoni', 'Mortadella', 'Chicken']);

export type PizzaType = z.infer<typeof PizzaTypeEnum>;
export type PizzaCrust = z.infer<typeof PizzaCrustEnum>;
export type PizzaExtras = z.infer<typeof PizzaExtrasEnum>;

// Pizza schema
export const PizzaSchema = z.object({
  id: z.string().uuid(),
  type: PizzaTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  crust: PizzaCrustEnum.nullable(),
  imageUrl: z.string().url('Valid image URL is required'),
  extras: PizzaExtrasEnum.nullable(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type Pizza = z.infer<typeof PizzaSchema>;

// Create pizza schema
export const CreatePizzaSchema = z.object({
  type: PizzaTypeEnum,
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  crust: PizzaCrustEnum.optional(),
  imageUrl: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or empty' }
  ),
  extras: PizzaExtrasEnum.optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
});

export type CreatePizza = z.infer<typeof CreatePizzaSchema>;

// Update pizza schema
export const UpdatePizzaSchema = z.object({
  type: PizzaTypeEnum.optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  crust: PizzaCrustEnum.optional(),
  imageUrl: z.string().url().optional(),
  extras: PizzaExtrasEnum.optional(),
  priceWithVat: z.string().or(z.number()).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ).optional(),
});

export type UpdatePizza = z.infer<typeof UpdatePizzaSchema>;

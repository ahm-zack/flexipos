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

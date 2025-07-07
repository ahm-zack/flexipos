import { z } from 'zod';

// Modifier types
export const modifierTypeSchema = z.enum(['extra', 'without']);
export const menuItemTypeSchema = z.enum(['pizza', 'pie', 'sandwich', 'mini_pie']);

// Create modifier request schema
export const createModifierSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  menuItemType: menuItemTypeSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  type: modifierTypeSchema,
  price: z.number().min(0, 'Price must be >= 0'),
  displayOrder: z.number().int().min(0).optional(),
}).refine((data) => {
  // If type is 'without', price must be 0
  if (data.type === 'without' && data.price !== 0) {
    return false;
  }
  return true;
}, {
  message: "Without modifiers must have price = 0",
  path: ['price'],
});

// Update modifier request schema
export const updateModifierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  type: modifierTypeSchema.optional(),
  price: z.number().min(0, 'Price must be >= 0').optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  // If type is 'without', price must be 0
  if (data.type === 'without' && data.price !== undefined && data.price !== 0) {
    return false;
  }
  return true;
}, {
  message: "Without modifiers must have price = 0",
  path: ['price'],
});

// Reorder modifiers request schema
export const reorderModifiersSchema = z.object({
  modifiers: z.array(z.object({
    id: z.string().uuid('Invalid modifier ID'),
    displayOrder: z.number().int().min(0, 'Display order must be >= 0'),
  })).min(1, 'At least one modifier is required'),
});

// Get modifiers query schema
export const getModifiersQuerySchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  menuItemType: menuItemTypeSchema,
});

// Export types inferred from schemas
export type CreateModifierInput = z.infer<typeof createModifierSchema>;
export type UpdateModifierInput = z.infer<typeof updateModifierSchema>;
export type ReorderModifiersInput = z.infer<typeof reorderModifiersSchema>;
export type GetModifiersQuery = z.infer<typeof getModifiersQuerySchema>;
export type ModifierType = z.infer<typeof modifierTypeSchema>;
export type MenuItemType = z.infer<typeof menuItemTypeSchema>;

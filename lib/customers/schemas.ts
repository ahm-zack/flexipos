import { z } from 'zod';

// Base customer schema for validation
export const customerSchema = z.object({
    id: z.string().uuid(),
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    address: z.string().max(500, 'Address too long').optional(),
    totalPurchases: z.coerce.number().min(0, 'Total purchases must be non-negative'),
    orderCount: z.coerce.number().min(0, 'Order count must be non-negative'),
    lastOrderAt: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().uuid(),
});

// Schema for creating a new customer
export const createCustomerSchema = z.object({
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    address: z.string().max(500, 'Address too long').optional(),
});

// Schema for updating a customer
export const updateCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    address: z.string().max(500, 'Address too long').optional(),
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long').optional(),
});

// Schema for customer search by phone
export const customerSearchSchema = z.object({
    phone: z.string().min(1, 'Phone number is required'),
});

// Schema for customer form data (used in UI forms)
export const customerFormSchema = z.object({
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    address: z.string().max(500, 'Address too long').optional(),
});

// Schema for customer search results
export const customerSearchResultSchema = z.object({
    id: z.string().uuid(),
    phone: z.string(),
    name: z.string(),
    address: z.string().optional(),
    totalPurchases: z.number(),
    orderCount: z.number(),
    lastOrderAt: z.string().datetime().optional(),
});

// Export TypeScript types from schemas
export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
export type CustomerForm = z.infer<typeof customerFormSchema>;
export type CustomerSearch = z.infer<typeof customerSearchSchema>;

// Re-export database types for convenience
export type {
    Customer,
    CustomerSearchResult,
} from './db-schema';

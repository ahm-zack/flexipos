import { z } from 'zod';

// Simple role enum (superadmin exists in DB but not exposed in forms)
export const AppRoleEnum = z.enum(['superadmin', 'admin', 'manager', 'staff']);
export type AppRole = z.infer<typeof AppRoleEnum>;

// Create user schema — used by app/api/users/route.ts
export const CreateUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.string().default('user'),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

// Modifier zod schema — used by modifier components and restaurant receipt
export const ModifierSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['extra', 'without']),
  name: z.string().min(1, 'Modifier name is required'),
  price: z.number().min(0, 'Price must be 0 or positive'),
});
export type Modifier = z.infer<typeof ModifierSchema>;

// ─── EOD Report Schemas ────────────────────────────────────────────────────────

export const PaymentMethodEnum = z.enum(['cash', 'card', 'mixed', 'delivery']);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const DeliveryPlatformEnum = z.enum(['keeta', 'hunger_station', 'jahez']);
export type DeliveryPlatform = z.infer<typeof DeliveryPlatformEnum>;

export const BestSellingItemSchema = z.object({
  itemName: z.string(),
  itemType: z.enum(['pizza', 'pie', 'sandwich', 'mini_pie', 'beverage', 'appetizer', 'burger', 'shawerma', 'side-order']),
  quantity: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  averagePrice: z.number().min(0),
});
export type BestSellingItem = z.infer<typeof BestSellingItemSchema>;

export const PaymentBreakdownSchema = z.object({
  method: PaymentMethodEnum,
  orderCount: z.number().int().min(0),
  totalAmount: z.number().min(0),
  percentage: z.number().min(0).max(100),
});
export type PaymentBreakdown = z.infer<typeof PaymentBreakdownSchema>;

export const DeliveryPlatformBreakdownSchema = z.object({
  platform: DeliveryPlatformEnum,
  orderCount: z.number().int().min(0),
  totalAmount: z.number().min(0),
  percentage: z.number().min(0).max(100),
});
export type DeliveryPlatformBreakdown = z.infer<typeof DeliveryPlatformBreakdownSchema>;

export const HourlySalesSchema = z.object({
  hour: z.number().int().min(0).max(23),
  orderCount: z.number().int().min(0),
  revenue: z.number().min(0),
});
export type HourlySales = z.infer<typeof HourlySalesSchema>;

export const EODReportDataSchema = z.object({
  startDateTime: z.date(),
  endDateTime: z.date(),
  reportGeneratedAt: z.date(),

  totalCashOrders: z.number().min(0),
  totalCardOrders: z.number().min(0),
  totalWithVat: z.number().min(0),
  totalWithoutVat: z.number().min(0),
  totalCancelledOrders: z.number().int().min(0),
  totalOrders: z.number().int().min(0),

  totalCashReceived: z.number().min(0),
  totalChangeGiven: z.number().min(0),

  completedOrders: z.number().int().min(0),

  vatAmount: z.number().min(0),
  averageOrderValue: z.number().min(0),

  paymentBreakdown: z.array(PaymentBreakdownSchema),
  deliveryPlatformBreakdown: z.array(DeliveryPlatformBreakdownSchema),

  bestSellingItems: z.array(BestSellingItemSchema),
  peakHour: z.string().optional(),
  hourlySales: z.array(HourlySalesSchema),

  orderCompletionRate: z.number().min(0).max(100),
  orderCancellationRate: z.number().min(0).max(100),

  previousPeriodComparison: z.object({
    revenueChange: z.number().optional(),
    orderCountChange: z.number().optional(),
    averageOrderValueChange: z.number().optional(),
  }).optional(),
});
export type EODReportData = z.infer<typeof EODReportDataSchema>;

export const EODReportRequestSchema = z.object({
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  saveToDatabase: z.boolean().default(false),
  includePreviousPeriodComparison: z.boolean().default(false),
});
export type EODReportRequest = z.infer<typeof EODReportRequestSchema>;

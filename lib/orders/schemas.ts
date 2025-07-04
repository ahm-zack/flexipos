import { z } from 'zod';

// Order status enum
export const OrderStatusEnum = z.enum(['pending', 'completed', 'canceled', 'modified']);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Order item schema - represents a single item in an order
export const OrderItemSchema = z.object({
  id: z.string().uuid(), // Item ID (pizza, pie, sandwich, etc.)
  type: z.enum(['pizza', 'pie', 'sandwich', 'mini_pie']), // Item type
  name: z.string().min(1), // Item name (English)
  nameAr: z.string().min(1), // Item name (Arabic)
  quantity: z.number().int().min(1), // Quantity ordered
  unitPrice: z.number().min(0), // Price per unit
  totalPrice: z.number().min(0), // Total price for this item (quantity * unitPrice)
  details: z.record(z.any()).optional(), // Additional details (size, extras, etc.)
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// Main order schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1), // Unique order number for display
  customerName: z.string().optional(), // Optional customer name
  items: z.array(OrderItemSchema).min(1), // Array of order items
  totalAmount: z.number().min(0), // Total order amount
  status: OrderStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(), // Cashier who created the order
});

export type Order = z.infer<typeof OrderSchema>;

// Create order schema (for new orders)
export const CreateOrderSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  createdBy: z.string().uuid(),
});

export type CreateOrder = z.infer<typeof CreateOrderSchema>;

// Update order schema (for editing orders)
export const UpdateOrderSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema).min(1).optional(),
  totalAmount: z.number().min(0).optional(),
  status: OrderStatusEnum.optional(),
});

export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;

// Canceled order schema
export const CanceledOrderSchema = z.object({
  id: z.string().uuid(),
  originalOrderId: z.string().uuid(),
  canceledAt: z.string().datetime(),
  canceledBy: z.string().uuid(),
  reason: z.string().optional(),
  orderData: OrderSchema, // Complete original order data
});

export type CanceledOrder = z.infer<typeof CanceledOrderSchema>;

// Create canceled order schema
export const CreateCanceledOrderSchema = z.object({
  originalOrderId: z.string().uuid(),
  canceledBy: z.string().uuid(),
  reason: z.string().optional(),
  orderData: OrderSchema,
});

export type CreateCanceledOrder = z.infer<typeof CreateCanceledOrderSchema>;

// Modification type enum
export const ModificationTypeEnum = z.enum([
  'item_added',
  'item_removed', 
  'quantity_changed',
  'item_replaced',
  'multiple_changes'
]);

export type ModificationType = z.infer<typeof ModificationTypeEnum>;

// Modified order schema
export const ModifiedOrderSchema = z.object({
  id: z.string().uuid(),
  originalOrderId: z.string().uuid(),
  modifiedAt: z.string().datetime(),
  modifiedBy: z.string().uuid(),
  modificationType: ModificationTypeEnum,
  originalData: OrderSchema, // Original order data
  newData: OrderSchema, // Modified order data
});

export type ModifiedOrder = z.infer<typeof ModifiedOrderSchema>;

// Create modified order schema
export const CreateModifiedOrderSchema = z.object({
  originalOrderId: z.string().uuid(),
  modifiedBy: z.string().uuid(),
  modificationType: ModificationTypeEnum,
  originalData: OrderSchema,
  newData: OrderSchema,
});

export type CreateModifiedOrder = z.infer<typeof CreateModifiedOrderSchema>;

// Cart item schema (for frontend cart management)
export const CartItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['pizza', 'pie', 'sandwich', 'mini_pie']),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  details: z.record(z.any()).optional(),
  imageUrl: z.string().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

// Cart schema
export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  totalAmount: z.number().min(0),
  itemCount: z.number().int().min(0),
});

export type Cart = z.infer<typeof CartSchema>;

// Order form schema (for creating orders from cart)
export const OrderFormSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
  totalAmount: z.number().min(0.01, 'Total amount must be greater than 0'),
});

export type OrderForm = z.infer<typeof OrderFormSchema>;

// Edit order form schema
export const EditOrderFormSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(CartItemSchema).min(1, 'Order must have at least one item'),
  totalAmount: z.number().min(0.01, 'Total amount must be greater than 0'),
});

export type EditOrderForm = z.infer<typeof EditOrderFormSchema>;

// Order query/filter schemas
export const OrderFiltersSchema = z.object({
  status: OrderStatusEnum.optional(),
  createdBy: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  customerName: z.string().optional(),
});

export type OrderFilters = z.infer<typeof OrderFiltersSchema>;

// Order response schema (for API responses)
export const OrderResponseSchema = z.object({
  order: OrderSchema,
  cashierName: z.string().optional(),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;

// Orders list response schema
export const OrdersListResponseSchema = z.object({
  orders: z.array(OrderResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type OrdersListResponse = z.infer<typeof OrdersListResponseSchema>;

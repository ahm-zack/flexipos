// Export hooks
export * from './hooks/use-orders';

// Re-export types for convenience
export type {
  ApiOrder,
  ApiOrderResponse,
  ApiCanceledOrder,
  ApiModifiedOrder,
  OrdersListResult,
  OrderFilters,
} from '@/lib/order-service';

export type {
  Order,
  OrderItem,
  CreateOrder,
  UpdateOrder,
  Cart,
  CartItem,
  OrderForm,
  EditOrderForm,
} from '@/lib/orders';

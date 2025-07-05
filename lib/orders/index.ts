// Export schemas with PaymentMethod
export * from './schemas';

// Export database tables and enums
export {
  orders,
  canceledOrders,
  modifiedOrders,
  ordersStatusEnum,
  paymentMethodEnum,
  itemTypeEnum,
  modificationTypeEnum,
  orderIndexes
} from './db-schema';

// Export database types with aliases to avoid conflicts
export type {
  Order as DbOrder,
  ModificationType,
  OrderItem as DbOrderItem,
  OrderWithItems,
  OrderResponse as DbOrderResponse
} from './db-schema';

// Re-export commonly used types for convenience
export type {
  Order,
  OrderItem,
  OrderStatus,
  Cart,
  CartItem,
  CreateOrder,
  UpdateOrder,
  CanceledOrder,
  ModifiedOrder,
  OrderForm,
  EditOrderForm,
  OrderFilters,
  OrderResponse,
  OrdersListResponse
} from './schemas';

export type {
  NewOrder as DbNewOrder,
  NewCanceledOrder as DbNewCanceledOrder,
  NewModifiedOrder as DbNewModifiedOrder,
  OrderWithItems as DbOrderWithItems,
  ItemType,
  ModificationType as DbModificationType
} from './db-schema';

// Export utility functions
export * from './utils';
export * from './server-utils';
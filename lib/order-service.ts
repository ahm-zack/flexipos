import { db } from '@/lib/db';
import { orders, canceledOrders, modifiedOrders, users } from '@/lib/db/schema';
import { eq, desc, and, like, sql } from 'drizzle-orm';
import { generateOrderNumber } from '@/lib/orders/server-utils';
import { saveOrderModifiers, getOrderModifiers } from '@/lib/modifiers-service';
import type { OrderItemModifier } from '@/lib/db/schema';
import type { OrderItem, OrderFilters } from '@/lib/orders';
import type { CartItem } from '@/lib/orders/schemas';

// Re-export for external use
export type { OrderFilters };

export interface OrderServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Database types (what we get from Drizzle)
export type DatabaseOrder = typeof orders.$inferSelect;
export type DatabaseCanceledOrder = typeof canceledOrders.$inferSelect;
export type DatabaseModifiedOrder = typeof modifiedOrders.$inferSelect;

// API types (what we return to frontend)
export interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mixed';
  status: 'completed' | 'canceled' | 'modified';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApiOrderResponse extends ApiOrder {
  cashierName?: string;
}

export interface ApiCanceledOrder {
  id: string;
  originalOrderId: string;
  canceledAt: string;
  canceledBy: string;
  reason?: string;
  orderData: ApiOrder;
}

export interface ApiModifiedOrder {
  id: string;
  originalOrderId: string;
  modifiedAt: string;
  modifiedBy: string;
  modificationType: 'item_added' | 'item_removed' | 'quantity_changed' | 'item_replaced' | 'multiple_changes';
  originalData: ApiOrder;
  newData: ApiOrder;
}

export interface OrdersListResult {
  orders: ApiOrderResponse[];
  total: number;
  page: number;
  limit: number;
}

// Helper function to transform database order to API order
function transformDatabaseOrderToApi(dbOrder: DatabaseOrder): ApiOrder {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.orderNumber,
    customerName: dbOrder.customerName,
    items: (dbOrder.items as OrderItem[]) || [],
    totalAmount: parseFloat(dbOrder.totalAmount),
    paymentMethod: dbOrder.paymentMethod,
    status: dbOrder.status,
    createdAt: dbOrder.createdAt.toISOString(),
    updatedAt: dbOrder.updatedAt.toISOString(),
    createdBy: dbOrder.createdBy,
  };
}

// Helper function to transform database canceled order to API canceled order
function transformDatabaseCanceledOrderToApi(dbCanceledOrder: DatabaseCanceledOrder): ApiCanceledOrder {
  return {
    id: dbCanceledOrder.id,
    originalOrderId: dbCanceledOrder.originalOrderId,
    canceledAt: dbCanceledOrder.canceledAt.toISOString(),
    canceledBy: dbCanceledOrder.canceledBy,
    reason: dbCanceledOrder.reason || undefined,
    orderData: dbCanceledOrder.orderData as ApiOrder,
  };
}

// Helper function to transform database modified order to API modified order
function transformDatabaseModifiedOrderToApi(dbModifiedOrder: DatabaseModifiedOrder): ApiModifiedOrder {
  return {
    id: dbModifiedOrder.id,
    originalOrderId: dbModifiedOrder.originalOrderId,
    modifiedAt: dbModifiedOrder.modifiedAt.toISOString(),
    modifiedBy: dbModifiedOrder.modifiedBy,
    modificationType: dbModifiedOrder.modificationType,
    originalData: dbModifiedOrder.originalData as ApiOrder,
    newData: dbModifiedOrder.newData as ApiOrder,
  };
}

// Helper function to convert cart items to order items
function convertCartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map(cartItem => {
    // Extract item type from category
    let itemType: 'pizza' | 'pie' | 'sandwich' | 'mini_pie';
    const category = cartItem.category.toLowerCase();
    
    if (category.includes('pizza')) {
      itemType = 'pizza';
    } else if (category.includes('pie')) {
      itemType = 'pie';
    } else if (category.includes('sandwich')) {
      itemType = 'sandwich';
    } else if (category.includes('mini')) {
      itemType = 'mini_pie';
    } else {
      // Default fallback
      itemType = 'pizza';
    }
    
    // Calculate total price including modifiers
    const modifiersTotal = cartItem.modifiersTotal || 0;
    const totalItemPrice = (cartItem.price + modifiersTotal) * cartItem.quantity;
    
    return {
      id: cartItem.id,
      type: itemType,
      name: cartItem.name,
      nameAr: cartItem.description || cartItem.name, // Use description as Arabic name fallback
      quantity: cartItem.quantity,
      unitPrice: cartItem.price + modifiersTotal, // Include modifiers in unit price
      totalPrice: totalItemPrice,
      details: {
        basePrice: cartItem.price,
        modifiersTotal: modifiersTotal,
        modifiers: cartItem.modifiers || [],
        description: cartItem.description,
        image: cartItem.image,
      }
    };
  });
}

export const orderService = {
  // Get all orders with optional filters
  async getOrders(
    filters: OrderFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<OrderServiceResult<OrdersListResult>> {
    try {
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const whereConditions = [];
      
      if (filters.status) {
        whereConditions.push(eq(orders.status, filters.status));
      }
      
      if (filters.createdBy) {
        whereConditions.push(eq(orders.createdBy, filters.createdBy));
      }
      
      if (filters.customerName) {
        whereConditions.push(like(orders.customerName, `%${filters.customerName}%`));
      }
      // Add orderNumber filter for partial match
      if (filters.orderNumber) {
        whereConditions.push(like(orders.orderNumber, `%${filters.orderNumber}%`));
      }
      if (filters.dateFrom) {
        whereConditions.push(sql`${orders.createdAt} >= ${filters.dateFrom}`);
      }
      
      if (filters.dateTo) {
        whereConditions.push(sql`${orders.createdAt} <= ${filters.dateTo}`);
      }
      // Add paymentMethod filter
      if (filters.paymentMethod) {
        whereConditions.push(eq(orders.paymentMethod, filters.paymentMethod));
      }

      // Combine conditions
      const whereClause = whereConditions.length > 0 
        ? and(...whereConditions) 
        : undefined;

      // Get orders with user information
      const ordersWithUsers = await db
        .select({
          order: orders,
          cashierName: users.name,
        })
        .from(orders)
        .leftJoin(users, eq(orders.createdBy, users.id))
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause);

      const total = totalResult[0]?.count || 0;

      // Transform results and add modifiers
      const orderResponses: ApiOrderResponse[] = [];
      for (const row of ordersWithUsers) {
        const baseOrder = transformDatabaseOrderToApi(row.order);
        // Use items as-is; modifiers are already present in the JSONB column
        orderResponses.push({
          ...baseOrder,
          cashierName: row.cashierName || undefined,
        });
      }

      return {
        success: true,
        data: {
          orders: orderResponses,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: 'Failed to fetch orders' };
    }
  },

  // Get order by ID
  async getOrderById(id: string): Promise<OrderServiceResult<ApiOrderResponse>> {
    try {
      const orderWithUser = await db
        .select({
          order: orders,
          cashierName: users.name,
        })
        .from(orders)
        .leftJoin(users, eq(orders.createdBy, users.id))
        .where(eq(orders.id, id))
        .limit(1);

      if (orderWithUser.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      const result = orderWithUser[0];
      const baseOrder = transformDatabaseOrderToApi(result.order);
      
      // Fetch modifiers for each order item
      const itemsWithModifiers = await Promise.all(
        baseOrder.items.map(async (item) => {
          // Extract the original menu item ID from the composite cart item ID
          // Cart item ID format: {menuItemId}-{timestamp}
          const originalMenuItemId = item.id.split('-').slice(0, -1).join('-');
          const modifiersResult = await getOrderModifiers(result.order.id, originalMenuItemId);
          if (modifiersResult.success && modifiersResult.data) {
            return {
              ...item,
              details: {
                ...item.details,
                savedModifiers: modifiersResult.data.map((modifier: OrderItemModifier) => ({
                  id: modifier.modifierId,
                  name: modifier.modifierName,
                  type: modifier.modifierType,
                  price: parseFloat(modifier.priceAtTime),
                })),
              },
            };
          }
          return item;
        })
      );

      const orderResponse: ApiOrderResponse = {
        ...baseOrder,
        items: itemsWithModifiers,
        cashierName: result.cashierName || undefined,
      };

      return { success: true, data: orderResponse };
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return { success: false, error: 'Failed to fetch order' };
    }
  },

  // Create new order
  async createOrder(orderData: {
    customerName?: string;
    items: CartItem[]; // Changed to accept CartItem[] instead of OrderItem[]
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mixed';
    createdBy: string;
  }): Promise<OrderServiceResult<ApiOrder>> {
    try {
      const orderNumber = await generateOrderNumber();
      const now = new Date();

      // Convert cart items to order items
      const orderItems = convertCartItemsToOrderItems(orderData.items);

      const newOrder = await db.insert(orders).values({
        orderNumber,
        customerName: orderData.customerName || null,
        items: orderItems,
        totalAmount: orderData.totalAmount.toString(),
        paymentMethod: orderData.paymentMethod,
        status: 'completed',
        createdBy: orderData.createdBy,
        createdAt: now,
        updatedAt: now,
      }).returning();

      const createdOrder = newOrder[0];

      // Save modifiers for items that have them
      for (const cartItem of orderData.items) {
        if (cartItem.modifiers && cartItem.modifiers.length > 0) {
          // Get the item type for modifiers
          let itemType: 'pizza' | 'pie' | 'sandwich' | 'mini_pie';
          const category = cartItem.category.toLowerCase();
          
          if (category.includes('pizza')) {
            itemType = 'pizza';
          } else if (category.includes('pie')) {
            itemType = 'pie';
          } else if (category.includes('sandwich')) {
            itemType = 'sandwich';
          } else if (category.includes('mini')) {
            itemType = 'mini_pie';
          } else {
            itemType = 'pizza';
          }

          // Extract modifier IDs
          const modifierIds = cartItem.modifiers.map(m => m.id);

          // Extract the original menu item ID from the composite cart item ID
          // Cart item ID format: {menuItemId}-{timestamp}
          const originalMenuItemId = cartItem.id.split('-').slice(0, -1).join('-');

          // Save modifiers for this cart item
          const result = await saveOrderModifiers(
            createdOrder.id,
            originalMenuItemId,
            itemType,
            modifierIds
          );

          if (!result.success) {
            console.error('Failed to save modifiers for item:', cartItem.id, result.error);
            // Continue with order creation even if modifier saving fails
          }
        }
      }

      return { success: true, data: transformDatabaseOrderToApi(createdOrder) };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'Failed to create order' };
    }
  },

  // Update order
  async updateOrder(
    id: string, 
    updateData: {
      customerName?: string;
      items?: OrderItem[];
      totalAmount?: number;
      status?: 'completed' | 'canceled' | 'modified';
      paymentMethod?: 'cash' | 'card' | 'mixed';
    }
  ): Promise<OrderServiceResult<ApiOrder>> {
    try {
      const updateFields: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (updateData.customerName !== undefined) {
        updateFields.customerName = updateData.customerName;
      }
      if (updateData.items !== undefined) {
        updateFields.items = updateData.items;
      }
      if (updateData.totalAmount !== undefined) {
        updateFields.totalAmount = updateData.totalAmount.toString();
      }
      if (updateData.status !== undefined) {
        updateFields.status = updateData.status;
      }
      if (updateData.paymentMethod !== undefined) {
        updateFields.paymentMethod = updateData.paymentMethod;
      }

      const updatedOrder = await db.update(orders)
        .set(updateFields)
        .where(eq(orders.id, id))
        .returning();

      if (updatedOrder.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      return { success: true, data: transformDatabaseOrderToApi(updatedOrder[0]) };
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, error: 'Failed to update order' };
    }
  },

  // Delete order (soft delete by updating status)
  async deleteOrder(id: string): Promise<OrderServiceResult<ApiOrder>> {
    try {
      const deletedOrder = await db.update(orders)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id))
        .returning();

      if (deletedOrder.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      return { success: true, data: transformDatabaseOrderToApi(deletedOrder[0]) };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: 'Failed to delete order' };
    }
  },

  // Cancel order (creates entry in canceled_orders table)
  async cancelOrder(
    orderId: string,
    canceledBy: string,
    reason?: string
  ): Promise<OrderServiceResult<ApiCanceledOrder>> {
    try {
      // First, get the original order
      const originalOrder = await this.getOrderById(orderId);
      if (!originalOrder.success || !originalOrder.data) {
        return { success: false, error: 'Order not found' };
      }

      // Update order status to canceled
      const updateResult = await this.updateOrder(orderId, { status: 'canceled' });
      if (!updateResult.success) {
        return { success: false, error: 'Failed to update order status' };
      }

      // Create canceled order record
      const canceledOrder = await db.insert(canceledOrders).values({
        originalOrderId: orderId,
        canceledBy,
        reason,
        orderData: originalOrder.data,
      }).returning();

      return { success: true, data: transformDatabaseCanceledOrderToApi(canceledOrder[0]) };
    } catch (error) {
      console.error('Error canceling order:', error);
      return { success: false, error: 'Failed to cancel order' };
    }
  },

  // Modify order (creates entry in modified_orders table)
  async modifyOrder(
    orderId: string,
    modifiedBy: string,
    newOrderData: {
      customerName?: string;
      items?: OrderItem[];
      totalAmount?: number;
      paymentMethod?: 'cash' | 'card' | 'mixed';
    },
    modificationType: 'item_added' | 'item_removed' | 'quantity_changed' | 'item_replaced' | 'multiple_changes'
  ): Promise<OrderServiceResult<ApiModifiedOrder>> {
    try {
      // Get original order
      const originalOrder = await this.getOrderById(orderId);
      if (!originalOrder.success || !originalOrder.data) {
        return { success: false, error: 'Order not found' };
      }

      // Update the order
      const updateResult = await this.updateOrder(orderId, {
        ...newOrderData,
        status: 'modified',
      });
      if (!updateResult.success) {
        return { success: false, error: 'Failed to update order' };
      }

      // Get updated order
      const updatedOrder = await this.getOrderById(orderId);
      if (!updatedOrder.success || !updatedOrder.data) {
        return { success: false, error: 'Failed to get updated order' };
      }

      // Create modified order record
      const modifiedOrder = await db.insert(modifiedOrders).values({
        originalOrderId: orderId,
        modifiedBy,
        modificationType,
        originalData: originalOrder.data,
        newData: updatedOrder.data,
      }).returning();

      return { success: true, data: transformDatabaseModifiedOrderToApi(modifiedOrder[0]) };
    } catch (error) {
      console.error('Error modifying order:', error);
      return { success: false, error: 'Failed to modify order' };
    }
  },

  // Get canceled orders
  async getCanceledOrders(): Promise<OrderServiceResult<ApiCanceledOrder[]>> {
    try {
      const canceledOrdersList = await db.select().from(canceledOrders).orderBy(desc(canceledOrders.canceledAt));
      const apiCanceledOrders = canceledOrdersList.map(transformDatabaseCanceledOrderToApi);
      return { success: true, data: apiCanceledOrders };
    } catch (error) {
      console.error('Error fetching canceled orders:', error);
      return { success: false, error: 'Failed to fetch canceled orders' };
    }
  },

  // Get modified orders
  async getModifiedOrders(): Promise<OrderServiceResult<ApiModifiedOrder[]>> {
    try {
      const modifiedOrdersList = await db.select().from(modifiedOrders).orderBy(desc(modifiedOrders.modifiedAt));
      const apiModifiedOrders = modifiedOrdersList.map(transformDatabaseModifiedOrderToApi);
      return { success: true, data: apiModifiedOrders };
    } catch (error) {
      console.error('Error fetching modified orders:', error);
      return { success: false, error: 'Failed to fetch modified orders' };
    }
  },

  // Get order history (including cancellations and modifications)
  async getOrderHistory(orderId: string): Promise<OrderServiceResult<{
    order: ApiOrderResponse;
    cancellations: ApiCanceledOrder[];
    modifications: ApiModifiedOrder[];
  }>> {
    try {
      const [orderResult, canceledResult, modifiedResult] = await Promise.all([
        this.getOrderById(orderId),
        db.select().from(canceledOrders).where(eq(canceledOrders.originalOrderId, orderId)),
        db.select().from(modifiedOrders).where(eq(modifiedOrders.originalOrderId, orderId)).orderBy(desc(modifiedOrders.modifiedAt))
      ]);

      if (!orderResult.success || !orderResult.data) {
        return { success: false, error: 'Order not found' };
      }

      return {
        success: true,
        data: {
          order: orderResult.data,
          cancellations: canceledResult.map(transformDatabaseCanceledOrderToApi),
          modifications: modifiedResult.map(transformDatabaseModifiedOrderToApi),
        },
      };
    } catch (error) {
      console.error('Error fetching order history:', error);
      return { success: false, error: 'Failed to fetch order history' };
    }
  },
};

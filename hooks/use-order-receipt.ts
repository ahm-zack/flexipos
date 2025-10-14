import { useQuery } from '@tanstack/react-query';
import { orderClientService } from '@/lib/order-client-service';
import type { Database } from '@/database.types';
import type { Order } from '@/lib/orders';

// Convert database order (snake_case) to receipt format (camelCase)
function convertOrderForReceipt(dbOrder: Database['public']['Tables']['orders']['Row']): Order {
  // Parse items from JSON and convert to expected format
  let parsedItems: Array<{
    id: string;
    name: string;
    type: "pizza" | "pie" | "sandwich" | "mini_pie";
    nameAr: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    details?: Record<string, unknown>;
  }> = [];

  try {
    if (dbOrder.items && typeof dbOrder.items === 'object') {
      const itemsArray = Array.isArray(dbOrder.items) ? dbOrder.items as Array<Record<string, unknown>> : [dbOrder.items as Record<string, unknown>];

      parsedItems = itemsArray.map((item, index) => ({
        id: String(item.id || `item-${index}`),
        name: String(item.name || 'Unknown Item'),
        type: (item.category && ['pizza', 'pie', 'sandwich', 'mini_pie'].includes(String(item.category).toLowerCase()))
          ? String(item.category).toLowerCase() as "pizza" | "pie" | "sandwich" | "mini_pie"
          : "pizza", // default fallback
        nameAr: String(item.name || 'Unknown Item'), // Use same name for Arabic if not available
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price || 0),
        totalPrice: Number(item.quantity || 1) * Number(item.price || 0),
        details: item.details as Record<string, unknown> || undefined,
      }));
    }
  } catch (error) {
    console.error('Error parsing order items:', error);
    parsedItems = [];
  }

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    dailySerial: dbOrder.daily_serial || undefined,
    status: dbOrder.status as 'completed' | 'canceled' | 'modified',
    totalAmount: dbOrder.total_amount || 0,
    customerName: dbOrder.customer_name || undefined,
    paymentMethod: dbOrder.payment_method as 'cash' | 'card' | 'mixed' | 'delivery',
    deliveryPlatform: (dbOrder.delivery_platform && ['keeta', 'hunger_station', 'jahez'].includes(dbOrder.delivery_platform))
      ? dbOrder.delivery_platform as 'keeta' | 'hunger_station' | 'jahez'
      : undefined,
    createdAt: dbOrder.created_at,
    discountAmount: dbOrder.discount_amount || undefined,
    discountType: (dbOrder.discount_type === 'percentage' || dbOrder.discount_type === 'amount')
      ? dbOrder.discount_type as 'percentage' | 'amount'
      : undefined,
    discountValue: dbOrder.discount_value || undefined,
    eventDiscountName: dbOrder.event_discount_name || undefined,
    eventDiscountPercentage: dbOrder.event_discount_percentage || undefined,
    eventDiscountAmount: dbOrder.event_discount_amount || undefined,
    cashAmount: dbOrder.cash_amount || undefined,
    cardAmount: dbOrder.card_amount || undefined,
    cashReceived: dbOrder.cash_received || undefined,
    changeAmount: dbOrder.change_amount || undefined,
    items: parsedItems,
    createdBy: dbOrder.created_by,
    updatedAt: dbOrder.updated_at,
    serialDate: dbOrder.serial_date || undefined,
  };
}

export function useOrderForReceipt(orderId: string) {
  return useQuery({
    queryKey: ['order-receipt', orderId],
    queryFn: async () => {
      const dbOrder = await orderClientService.getOrderById(orderId);

      if (!dbOrder) {
        throw new Error('Order not found');
      }

      return convertOrderForReceipt(dbOrder);
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

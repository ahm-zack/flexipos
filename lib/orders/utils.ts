/**
 * Utility functions for orders management
 */

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXXXX (where X is random)
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 6 random digits
  const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return `ORD-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Calculate total amount from order items
 */
export function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
}

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.replace(/^ORD-/, '#');
}

/**
 * Parse order number to extract date
 */
export function parseOrderDate(orderNumber: string): Date | null {
  const match = orderNumber.match(/^ORD-(\d{4})(\d{2})(\d{2})-/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Validate order items structure
 */
export function validateOrderItems(items: unknown[]): boolean {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every(item => {
    if (typeof item !== 'object' || item === null) return false;
    
    const orderItem = item as Record<string, unknown>;
    
    return (
      typeof orderItem.id === 'string' &&
      typeof orderItem.type === 'string' &&
      typeof orderItem.name === 'string' &&
      typeof orderItem.nameAr === 'string' &&
      typeof orderItem.quantity === 'number' &&
      typeof orderItem.unitPrice === 'number' &&
      typeof orderItem.totalPrice === 'number' &&
      orderItem.quantity > 0 &&
      orderItem.unitPrice >= 0 &&
      orderItem.totalPrice >= 0
    );
  });
}

/**
 * Convert order items to display format
 */
export function formatOrderItems(items: Array<{
  name: string;
  nameAr: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}>): string {
  return items
    .map(item => `${item.name} (${item.nameAr}) x${item.quantity}`)
    .join(', ');
}

/**
 * Get order status display color
 */
export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'green';
    case 'canceled':
      return 'red';
    case 'modified':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Get order status display text
 */
export function getOrderStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'canceled':
      return 'Canceled';
    case 'modified':
      return 'Modified';
    default:
      return 'Unknown';
  }
}

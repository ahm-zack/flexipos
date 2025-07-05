/**
 * Utility functions for orders management (CLIENT-SAFE)
 * This file contains functions that can be safely used in both client and server environments
 */

/**
 * Calculate total amount from order items
 */
export function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
}

/**
 * Format order number for display
 * Removes the ORD- prefix for display purposes
 */
export function formatOrderNumber(orderNumber: string): string {
  // For new format ORD-0001, return just the number part
  if (orderNumber.startsWith('ORD-')) {
    return orderNumber.replace('ORD-', '#');
  }
  
  // For legacy formats, return as is with # prefix
  return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
}

/**
 * Parse order number to extract sequence number
 */
export function parseOrderNumber(orderNumber: string): number | null {
  // For new format ORD-0001
  const newFormatMatch = orderNumber.match(/^ORD-(\d+)$/);
  if (newFormatMatch) {
    return parseInt(newFormatMatch[1], 10);
  }
  
  return null;
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

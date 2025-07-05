/**
 * Server-side utility functions for orders management
 * This file contains functions that require database access and should only be used on the server
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * Generate a unique order number using database sequence (SERVER-SIDE ONLY)
 * Format: ORD-0001, ORD-0002, etc.
 */
export async function generateOrderNumber(): Promise<string> {
  try {
    // Use the database function to generate the next order number
    const result = await db.execute(sql`SELECT generate_order_number() as order_number`);
    const orderNumber = result[0]?.order_number as string;
    
    if (!orderNumber) {
      throw new Error('Failed to generate order number');
    }
    
    return orderNumber;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback to timestamp-based generation if database function fails
    return generateFallbackOrderNumber();
  }
}

/**
 * Fallback order number generation (timestamp-based)
 * Used if database sequence is not available
 */
function generateFallbackOrderNumber(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${randomSuffix}`;
}

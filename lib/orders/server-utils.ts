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
    console.error('Error generating order number using database function:', error);
    // Fallback to application-level generation if database function fails
    return await generateApplicationOrderNumber();
  }
}

/**
 * Application-level order number generation
 * Used if database sequence is not available
 * This ensures we always get ORD-0001 format
 */
async function generateApplicationOrderNumber(): Promise<string> {
  try {
    // Get the highest existing order number
    const result = await db.execute(sql`
      SELECT order_number 
      FROM orders 
      WHERE order_number ~ '^ORD-[0-9]+$'
      ORDER BY order_number DESC 
      LIMIT 1
    `);
    
    let nextNumber = 1;
    
    if (result.length > 0 && result[0].order_number) {
      const currentNumber = result[0].order_number as string;
      const numberPart = currentNumber.replace('ORD-', '');
      nextNumber = parseInt(numberPart, 10) + 1;
    }
    
    return `ORD-${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating application-level order number:', error);
    // Ultimate fallback - use timestamp-based but in correct format
    return generateTimestampOrderNumber();
  }
}

/**
 * Ultimate fallback order number generation (timestamp-based)
 * Used if both database and application generation fail
 */
function generateTimestampOrderNumber(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.toString().slice(-4)}-${randomSuffix}`;
}

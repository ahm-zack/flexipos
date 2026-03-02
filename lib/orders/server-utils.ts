/**
 * Server-side utility functions for orders management
 * This file contains functions that require database access and should only be used on the server
 */

import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Generate a unique order number using database sequence (SERVER-SIDE ONLY)
 * Format: ORD-0001, ORD-0002, etc.
 */
export async function generateOrderNumber(): Promise<string> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc('generate_order_number');

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to generate order number');
    }

    return data as string;
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
    const adminClient = createAdminClient();
    // Fetch the highest ORD-XXXX order number (prefix filter is a good-enough proxy)
    const { data } = await adminClient
      .from('orders')
      .select('order_number')
      .like('order_number', 'ORD-%')
      .order('order_number', { ascending: false })
      .limit(1);

    let nextNumber = 1;

    if (data && data.length > 0 && data[0].order_number) {
      const currentNumber = data[0].order_number as string;
      const numberPart = currentNumber.replace('ORD-', '');
      const parsed = parseInt(numberPart, 10);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
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

/**
 * Test script to verify orders management system setup
 */

import { db } from '../db';
import { orders } from '../orders/db-schema';
import { generateOrderNumber, calculateOrderTotal } from '../orders/utils';
import { CreateOrderSchema } from '../orders/schemas';

async function testOrdersSystem() {
  console.log('🧪 Testing Orders Management System...\n');

  try {
    // Test 1: Order number generation
    console.log('1. Testing order number generation...');
    const orderNumber = generateOrderNumber();
    console.log(`   Generated order number: ${orderNumber}`);
    
    // Test 2: Order total calculation
    console.log('\n2. Testing order total calculation...');
    const testItems = [
      { quantity: 2, unitPrice: 15.50 },
      { quantity: 1, unitPrice: 8.75 }
    ];
    const total = calculateOrderTotal(testItems);
    console.log(`   Calculated total: $${total.toFixed(2)}`);
    
    // Test 3: Schema validation
    console.log('\n3. Testing schema validation...');
    const sampleOrder = {
      customerName: 'Test Customer',
      items: [{
        id: 'pizza-1',
        type: 'pizza' as const,
        name: 'Margherita Pizza',
        nameAr: 'بيتزا مارغريتا',
        quantity: 2,
        unitPrice: 15.50,
        totalPrice: 31.00
      }],
      totalAmount: 31.00,
      createdBy: '123e4567-e89b-12d3-a456-426614174000'
    };
    
    CreateOrderSchema.parse(sampleOrder);
    console.log('   ✅ Order validation passed');
    
    // Test 4: Database connection
    console.log('\n4. Testing database connection...');
    const orderCount = await db.select().from(orders);
    console.log(`   Current orders count: ${orderCount.length}`);
    
    console.log('\n✅ All tests passed! Orders management system is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testOrdersSystem();
}

export { testOrdersSystem };

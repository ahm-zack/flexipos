/**
 * Simple test to verify the orders API works with a valid user ID
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function testOrderAPI() {
  try {
    console.log("🧪 Testing Order API directly...\n");

    // Using a known valid user ID from the check-users.js output
    const validUserId = "c2f7e559-0bfb-4a5a-9413-b0686167a582"; // superadmin@example.com

    console.log(`Using user ID: ${validUserId}`);

    // Create test order data
    const orderData = {
      items: [
        {
          id: "test-pizza-1",
          type: "pizza",
          name: "Test Pizza",
          nameAr: "Test Pizza",
          quantity: 1,
          unitPrice: 25.0,
          totalPrice: 25.0,
          details: {
            category: "Pizza",
            description: "Test description",
          },
        },
      ],
      totalAmount: 25.0,
      createdBy: validUserId,
      customerName: "Test Customer",
    };

    console.log("Order data:", JSON.stringify(orderData, null, 2));

    // Test by importing the order service directly
    const { createOrder } = require("./lib/order-service");

    console.log("Creating order via service...");
    const result = await createOrder(orderData);

    if (result.success) {
      console.log("✅ Order created successfully!");
      console.log("📋 Order details:", {
        orderNumber: result.data.orderNumber,
        total: result.data.totalAmount,
        status: result.data.status,
        createdBy: result.data.createdBy,
      });
    } else {
      console.error("❌ Order creation failed:", result.error);
    }

    return result.success;
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

testOrderAPI().then((success) => {
  process.exit(success ? 0 : 1);
});

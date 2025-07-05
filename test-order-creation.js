/**
 * Test script to verify order creation with valid user ID
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function testOrderCreation() {
  try {
    const adminClient = createAdminClient();

    console.log("🧪 Testing Order Creation with Valid User ID...\n");

    // Get a valid user ID from the database
    const { data: users, error: userError } = await adminClient
      .from("users")
      .select("id, email, name")
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error("❌ No users found in database:", userError);
      return false;
    }

    const testUser = users[0];
    console.log(`Using test user: ${testUser.email} (ID: ${testUser.id})`);

    // Create test order data
    const orderData = {
      items: [
        {
          id: "test-pizza-1",
          type: "pizza",
          name: "Test Pizza",
          nameAr: "Test Pizza",
          quantity: 2,
          unitPrice: 25.0,
          totalPrice: 50.0,
          details: {
            category: "Pizza",
            description: "Test description",
          },
        },
      ],
      totalAmount: 50.0,
      createdBy: testUser.id,
      customerName: "Test Customer",
    };

    // Call the API endpoint
    const response = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API call failed:", response.status, errorText);
      return false;
    }

    const result = await response.json();

    if (!result.success) {
      console.error("❌ Order creation failed:", result.error);
      return false;
    }

    console.log("✅ Order created successfully!");
    console.log("📋 Order details:", {
      orderNumber: result.data.orderNumber,
      total: result.data.totalAmount,
      status: result.data.status,
      createdBy: result.data.createdBy,
    });

    return true;
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

testOrderCreation().then((success) => {
  process.exit(success ? 0 : 1);
});

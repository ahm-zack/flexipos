/**
 * Update existing pending orders to completed
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

async function updatePendingOrders() {
  try {
    const adminClient = createAdminClient();

    console.log("🔄 Updating pending orders to completed...\n");

    // First, check for existing pending orders
    const { data: pendingOrders, error: selectError } = await adminClient
      .from("orders")
      .select("id, order_number, status")
      .eq("status", "pending");

    if (selectError) {
      console.error("❌ Error finding pending orders:", selectError);
      return false;
    }

    if (pendingOrders && pendingOrders.length > 0) {
      console.log(`📋 Found ${pendingOrders.length} pending orders to update:`);
      pendingOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order.order_number} (${order.id})`);
      });

      // Update all pending orders to completed
      const { error: updateError } = await adminClient
        .from("orders")
        .update({ status: "completed" })
        .eq("status", "pending");

      if (updateError) {
        console.error("❌ Error updating pending orders:", updateError);
        return false;
      }

      console.log("✅ Successfully updated all pending orders to completed");
    } else {
      console.log("📋 No pending orders found to update");
    }

    console.log("\n🎉 Update completed!");
    return true;
  } catch (error) {
    console.error("❌ Update failed with error:", error);
    return false;
  }
}

updatePendingOrders().then((success) => {
  process.exit(success ? 0 : 1);
});

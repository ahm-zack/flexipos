// Test script to verify modifier fix
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testModifierFix() {
  try {
    console.log("🔍 Testing modifier fix...\n");

    // Check if there are any order_item_modifiers
    const { data: orderModifiers, error: modifiersError } = await supabase
      .from("order_item_modifiers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (modifiersError) {
      console.error("❌ Error fetching order modifiers:", modifiersError);
      return;
    }

    console.log("📊 Recent order modifiers in database:");
    if (orderModifiers.length === 0) {
      console.log(
        "   No order modifiers found. This might indicate the bug is still present."
      );
    } else {
      console.table(
        orderModifiers.map((mod) => ({
          order_id: mod.order_id,
          menu_item_id: mod.menu_item_id,
          modifier_name: mod.modifier_name,
          modifier_type: mod.modifier_type,
          price_at_time: mod.price_at_time,
        }))
      );
    }

    // Check recent orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (ordersError) {
      console.error("❌ Error fetching orders:", ordersError);
      return;
    }

    console.log("\n📋 Recent orders:");
    if (orders.length === 0) {
      console.log("   No orders found.");
    } else {
      console.table(
        orders.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          total_amount: order.total_amount,
          created_at: new Date(order.created_at).toLocaleString(),
        }))
      );
    }

    // Check if we have the specific menu item we're testing with
    const { data: menuItems, error: menuError } = await supabase
      .from("pizzas")
      .select("id, name")
      .eq("name", "Margherita")
      .limit(1);

    if (!menuError && menuItems.length > 0) {
      const margheritaId = menuItems[0].id;
      console.log(`\n🍕 Found Margherita pizza with ID: ${margheritaId}`);

      // Check if there are modifiers for this pizza
      const { data: modifiers, error: modError } = await supabase
        .from("menu_item_modifiers")
        .select("*")
        .eq("menu_item_id", margheritaId)
        .eq("menu_item_type", "pizza");

      if (!modError && modifiers.length > 0) {
        console.log("✅ Available modifiers for Margherita pizza:");
        console.table(
          modifiers.map((mod) => ({
            id: mod.id,
            name: mod.name,
            type: mod.type,
            price: mod.price,
          }))
        );
      }
    }

    console.log("\n💡 To test the fix:");
    console.log("1. Open http://localhost:3000 in browser");
    console.log("2. Login as cashier@example.com");
    console.log("3. Add Margherita pizza with modifiers to cart");
    console.log("4. Complete the order");
    console.log("5. Run this script again to see if modifiers were saved");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

testModifierFix();

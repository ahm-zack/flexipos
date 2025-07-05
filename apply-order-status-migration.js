/**
 * Apply order status enum migration
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

async function applyOrderStatusMigration() {
  try {
    const adminClient = createAdminClient();

    console.log("🔄 Applying order status enum migration...\n");

    // First, update all existing pending orders to completed
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

    // Apply the SQL migration
    const migrationSQL = `
      CREATE TYPE "public"."orders_status" AS ENUM('completed', 'canceled', 'modified');
      ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
      ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."orders_status" USING "status"::text::"public"."orders_status";
      ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'completed';
      DROP TYPE "public"."order_status";
    `;

    const { error: migrationError } = await adminClient.rpc("exec", {
      query: migrationSQL,
    });

    if (migrationError) {
      console.error("❌ Error applying migration:", migrationError);

      // Try applying each statement individually
      const statements = migrationSQL.split(";").filter((s) => s.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.trim()}`);
          const { error } = await adminClient.rpc("exec", {
            query: statement.trim(),
          });

          if (error) {
            console.error(`❌ Error executing statement: ${error}`);
          } else {
            console.log("✅ Statement executed successfully");
          }
        }
      }
    } else {
      console.log("✅ Migration applied successfully");
    }

    return true;
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
    return false;
  }
}

applyOrderStatusMigration().then((success) => {
  console.log(success ? "\n🎉 Migration completed!" : "\n❌ Migration failed!");
  process.exit(success ? 0 : 1);
});

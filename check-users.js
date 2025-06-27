/**
 * Script to check current users in the system
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

async function checkUsers() {
  try {
    const adminClient = createAdminClient();

    console.log("📋 Current Users in System:\n");

    // Get users from database
    console.log("Database Users:");
    const { data: dbUsers, error: dbError } = await adminClient
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("❌ Error fetching database users:", dbError);
    } else {
      if (dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((user, index) => {
          console.log(
            `${index + 1}. ${user.email} (${user.role}) - ID: ${user.id}`
          );
        });
      } else {
        console.log("   No users found in database");
      }
    }

    // Get users from auth
    console.log("\nAuth Users:");
    const { data: authUsers, error: authError } =
      await adminClient.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
    } else {
      if (authUsers.users && authUsers.users.length > 0) {
        authUsers.users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email} - ID: ${user.id}`);
          console.log(
            `   Role in JWT: ${user.app_metadata?.user_role || "Not set"}`
          );
          console.log(`   Created: ${user.created_at}`);
          console.log("");
        });
      } else {
        console.log("   No users found in auth");
      }
    }
  } catch (error) {
    console.error("❌ Error checking users:", error);
  }
}

checkUsers();

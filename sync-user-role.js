/**
 * Manual script to sync a specific user's role to JWT custom claims
 * Run this when you need to manually sync a user's role
 */

const { createClient } = require("@supabase/supabase-js");

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing required environment variables for Supabase admin client"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function syncUserRole(userId, role) {
  try {
    const adminClient = createAdminClient();

    console.log(`Syncing role '${role}' for user ${userId}...`);

    // Update user metadata in auth.users table using admin client
    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        app_metadata: {
          user_role: role,
        },
      }
    );

    if (error) {
      console.error("Error syncing role to custom claims:", error);
      return false;
    }

    console.log("✅ Successfully synced role to custom claims");
    console.log("Updated user metadata:", data.user.app_metadata);
    return true;
  } catch (error) {
    console.error("Failed to sync role:", error);
    return false;
  }
}

// Load environment variables
require("dotenv").config({ path: ".env.local" });

// Sync your specific user
const USER_ID = "5993cedb-d29f-4c83-8113-e03ccf7bb499";
const ROLE = "superadmin";

syncUserRole(USER_ID, ROLE).then((success) => {
  if (success) {
    console.log(
      "🎉 Role sync completed! Please refresh your session/re-login to get the new JWT token."
    );
  } else {
    console.log("❌ Role sync failed!");
  }
  process.exit(success ? 0 : 1);
});

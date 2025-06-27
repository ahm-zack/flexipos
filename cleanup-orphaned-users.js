/**
 * Cleanup script to remove orphaned auth users that don't have database records
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

async function cleanupOrphanedUsers() {
  try {
    const adminClient = createAdminClient();

    console.log("🧹 Cleaning up orphaned auth users...\n");

    // Get all auth users
    const { data: authData, error: authError } =
      await adminClient.auth.admin.listUsers();
    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
      return;
    }

    // Get all database users
    const { data: dbUsers, error: dbError } = await adminClient
      .from("users")
      .select("id");
    if (dbError) {
      console.error("❌ Error fetching database users:", dbError);
      return;
    }

    const dbUserIds = new Set(dbUsers.map((u) => u.id));
    const orphanedUsers = authData.users.filter(
      (user) => !dbUserIds.has(user.id)
    );

    if (orphanedUsers.length === 0) {
      console.log("✅ No orphaned users found");
      return;
    }

    console.log(`Found ${orphanedUsers.length} orphaned auth users:`);
    orphanedUsers.forEach((user) => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });

    console.log("\nDeleting orphaned users...");

    for (const user of orphanedUsers) {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(
        user.id
      );
      if (deleteError) {
        console.error(`❌ Failed to delete ${user.email}:`, deleteError);
      } else {
        console.log(`✅ Deleted ${user.email}`);
      }
    }

    console.log("\n🎉 Cleanup completed!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}

cleanupOrphanedUsers();

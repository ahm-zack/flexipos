/**
 * Test script to verify the createUserAction function specifically
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

async function testCreateUserAction() {
  try {
    const adminClient = createAdminClient();

    console.log("🧪 Testing Create User Action Flow...\n");

    // Test email
    const testEmail = `test-action-${Date.now()}@example.com`;
    const testPassword = "password123";
    const testRole = "cashier";
    const testName = "Test User";

    console.log(`Creating test user: ${testEmail}`);

    // Simulate the actual createUserAction flow
    console.log("Step 1: Creating auth user with admin client...");
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        app_metadata: {
          user_role: testRole,
        },
      });

    if (authError) {
      console.error("❌ Auth user creation failed:", authError);
      return false;
    }

    console.log("✅ Auth user created successfully");
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   App Metadata:`, authData.user.app_metadata);

    // Step 2: Create user in database using admin client
    console.log("\nStep 2: Creating database user with admin client...");
    const { data: dbData, error: dbError } = await adminClient
      .from("users")
      .insert({
        id: authData.user.id,
        email: testEmail,
        name: testName,
        role: testRole,
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database user creation failed:", dbError);

      // Cleanup: Delete the auth user if db creation failed
      console.log("Cleaning up auth user...");
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return false;
    }

    console.log("✅ Database user created successfully");
    console.log(`   Database record:`, dbData);

    // Step 3: Verify the user can login
    console.log("\nStep 3: Testing user login...");
    const regularClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: loginData, error: loginError } =
      await regularClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (loginError) {
      console.error("❌ User login failed:", loginError);
    } else {
      console.log("✅ User login successful");
      console.log(`   JWT claims:`, loginData.user.app_metadata);

      // Sign out
      await regularClient.auth.signOut();
    }

    // Cleanup: Delete the test user
    console.log("\nCleaning up test user...");

    // Delete from database
    const { error: deleteDbError } = await adminClient
      .from("users")
      .delete()
      .eq("id", authData.user.id);

    if (deleteDbError) {
      console.error("❌ Failed to delete from database:", deleteDbError);
    }

    // Delete from auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
      authData.user.id
    );

    if (deleteAuthError) {
      console.error("❌ Failed to delete from auth:", deleteAuthError);
    } else {
      console.log("✅ Test user cleaned up successfully");
    }

    return true;
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

testCreateUserAction().then((success) => {
  if (success) {
    console.log("\n🎉 Create User Action test completed successfully!");
  } else {
    console.log("\n❌ Create User Action test failed!");
  }
  process.exit(success ? 0 : 1);
});

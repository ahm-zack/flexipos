/**
 * Test script to verify user creation functionality
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

function createRegularClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function testUserCreation() {
  try {
    const adminClient = createAdminClient();
    const regularClient = createRegularClient();

    console.log("🧪 Testing User Creation Functionality...\n");

    // Test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "password123";
    const testRole = "cashier";

    console.log(`Creating test user: ${testEmail}`);

    // 1. Create user in auth using admin client
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
    console.log("   User ID:", authData.user.id);
    console.log("   App Metadata:", authData.user.app_metadata);

    // 2. Add user to database
    const { data: dbData, error: dbError } = await regularClient
      .from("users")
      .insert({
        id: authData.user.id,
        email: testEmail,
        name: "Test User",
        role: testRole,
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database user creation failed:", dbError);
      return false;
    }

    console.log("✅ Database user created successfully");
    console.log("   Database record:", dbData);

    // 3. Test login
    console.log("\n🔐 Testing login...");
    const { data: loginData, error: loginError } =
      await regularClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (loginError) {
      console.error("❌ Login failed:", loginError);
      return false;
    }

    console.log("✅ Login successful");
    console.log(
      "   JWT contains role:",
      loginData.user.app_metadata?.user_role
    );

    // 4. Clean up - delete test user
    console.log("\n🧹 Cleaning up test user...");
    await adminClient.auth.admin.deleteUser(authData.user.id);
    await regularClient.from("users").delete().eq("id", authData.user.id);
    console.log("✅ Test user cleaned up");

    console.log(
      "\n🎉 All tests passed! User creation functionality is working correctly."
    );
    return true;
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
}

testUserCreation().then((success) => {
  process.exit(success ? 0 : 1);
});

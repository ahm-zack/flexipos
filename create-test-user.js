/**
 * Test script to create a test user for edit functionality testing
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

async function createTestUser() {
  try {
    console.log("🧪 Creating test user for edit functionality...\n");

    const adminClient = createAdminClient();
    const testEmail = `edit-test-${Date.now()}@example.com`;
    const testPassword = "password123";
    const testRole = "cashier";
    const testName = "Edit Test User";

    console.log(`Creating test user: ${testEmail}`);

    // Create auth user
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

    // Create database user using API call
    const response = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        name: testName,
        role: testRole,
        password: testPassword,
      }),
    });

    if (!response.ok) {
      console.error("❌ API user creation failed:", await response.text());
      // Cleanup auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return false;
    }

    const result = await response.json();
    if (!result.success) {
      console.error("❌ API user creation failed:", result.error);
      // Cleanup auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return false;
    }

    console.log("✅ Test user created successfully!");
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Name: ${testName}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Role: ${testRole}`);
    console.log("\n🎯 Now you can test the edit functionality:");
    console.log("   1. Go to http://localhost:3000/admin/users");
    console.log("   2. Click the menu (three dots) for the test user");
    console.log('   3. Click "Edit" to test the edit dialog');
    console.log("\n⚠️  Remember to delete this test user when done!");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

createTestUser();

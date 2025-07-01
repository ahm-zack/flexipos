/**
 * Script to set JWT custom claims for a specific user
 * This will add the user_role to the JWT custom claims
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

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

async function setUserClaims() {
  try {
    const userId = "c88f1e6a-9411-4054-8736-826c5ffc9e3f";
    const email = "ahm.zack.dev@gmail.com";

    console.log("🔧 Setting JWT custom claims for user:", email);
    console.log("📋 User ID:", userId);

    const supabase = createAdminClient();

    // Update the user's app_metadata with the role
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        user_role: "superadmin",
      },
    });

    if (error) {
      console.error("❌ Error setting custom claims:", error);
      return;
    }

    console.log("✅ Successfully set custom claims!");
    console.log("👤 User details:", {
      id: data.user.id,
      email: data.user.email,
      role: data.user.app_metadata?.user_role,
    });

    console.log(
      "\n🔄 Important: You need to log out and log back in for changes to take effect."
    );
    console.log(
      "🌐 The JWT token needs to be refreshed to include the new claims."
    );
  } catch (error) {
    console.error("💥 Script error:", error);
  }
}

setUserClaims();

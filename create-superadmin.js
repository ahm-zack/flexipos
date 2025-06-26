#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  try {
    // Create auth user for superadmin
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: "superadmin@example.com",
        password: "password123",
        email_confirm: true,
      });

    if (authError) {
      console.error("Auth error:", authError);
      return;
    }

    console.log("Superadmin auth user created:", authData.user.id);

    // Update the existing superadmin user with the correct auth ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update({ id: authData.user.id })
      .eq("email", "superadmin@example.com");

    if (userError) {
      console.error("User update error:", userError);
      return;
    }

    console.log("Superadmin user updated successfully!");
    console.log("Email: superadmin@example.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error creating superadmin:", error);
  }
}

createSuperAdmin();

#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTestUser() {
  try {
    // Update or insert user in public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert([
        {
          id: "7c0ebe35-d1aa-4054-a525-d6210a04f47c",
          name: "Super Admin",
          email: "admin@example.com",
          role: "superadmin",
        },
      ]);

    if (userError) {
      console.error("User error:", userError);
      return;
    }

    console.log("User updated in users table:", userData);
    console.log("Test user ready!");
    console.log("Email: admin@example.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error updating test user:", error);
  }
}

updateTestUser();

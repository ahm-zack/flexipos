#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: "admin@example.com",
        password: "password123",
        email_confirm: true,
      });

    if (authError) {
      console.error("Auth error:", authError);
      return;
    }

    console.log("Auth user created:", authData);

    // Create user in public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          name: "Super Admin",
          email: "admin@example.com",
          role: "superadmin",
        },
      ]);

    if (userError) {
      console.error("User error:", userError);
      return;
    }

    console.log("User created in users table:", userData);
    console.log("Test user created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser();

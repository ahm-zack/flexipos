#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdminAuth() {
  try {
    // First, get the superadmin user ID from public.users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("role", "superadmin")
      .single();

    if (userError) {
      console.error("User lookup error:", userError);
      return;
    }

    console.log("Superadmin user:", users);

    // Create auth user with the existing user ID
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: users.email,
        password: "password123",
        email_confirm: true,
        user_id: users.id,
      });

    if (authError) {
      console.error("Auth error:", authError);
      return;
    }

    console.log("Superadmin auth user created successfully!");
    console.log("Email:", users.email);
    console.log("Password: password123");
  } catch (error) {
    console.error("Error:", error);
  }
}

createSuperAdminAuth();

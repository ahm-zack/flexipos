#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  try {
    // Check users in public.users table
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*");

    if (userError) {
      console.error("User error:", userError);
      return;
    }

    console.log("Users in database:", users);

    // Check auth users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Auth error:", authError);
      return;
    }

    console.log(
      "Auth users:",
      authUsers.users.map((u) => ({ id: u.id, email: u.email }))
    );
  } catch (error) {
    console.error("Error checking users:", error);
  }
}

checkUsers();

import { createClient } from "@supabase/supabase-js";

// This is a test to verify the image upload buckets are working
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBuckets() {
  console.log("Testing storage buckets...");

  // Test if buckets exist and are accessible
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError);
    return;
  }

  console.log(
    "Available buckets:",
    buckets.map((b) => b.name)
  );

  // Check if our specific buckets exist
  const pieImagesBucket = buckets.find((b) => b.name === "pie-images");
  const pizzaImagesBucket = buckets.find((b) => b.name === "pizza-images");

  if (pieImagesBucket) {
    console.log("✅ pie-images bucket exists");
  } else {
    console.log("❌ pie-images bucket missing");
  }

  if (pizzaImagesBucket) {
    console.log("✅ pizza-images bucket exists");
  } else {
    console.log("❌ pizza-images bucket missing");
  }

  // Test bucket accessibility by trying to list files (should be empty but not error)
  try {
    const { data: pieFiles, error: pieError } = await supabase.storage
      .from("pie-images")
      .list();

    if (pieError) {
      console.error("❌ Error accessing pie-images bucket:", pieError);
    } else {
      console.log(
        "✅ pie-images bucket is accessible (files:",
        pieFiles.length,
        ")"
      );
    }
  } catch (err) {
    console.error("❌ Exception accessing pie-images bucket:", err);
  }

  try {
    const { data: pizzaFiles, error: pizzaError } = await supabase.storage
      .from("pizza-images")
      .list();

    if (pizzaError) {
      console.error("❌ Error accessing pizza-images bucket:", pizzaError);
    } else {
      console.log(
        "✅ pizza-images bucket is accessible (files:",
        pizzaFiles.length,
        ")"
      );
    }
  } catch (err) {
    console.error("❌ Exception accessing pizza-images bucket:", err);
  }
}

testBuckets()
  .then(() => {
    console.log("Test completed");
  })
  .catch((err) => {
    console.error("Test failed:", err);
  });

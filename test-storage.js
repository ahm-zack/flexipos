#!/usr/bin/env node

// Storage Test Script for Local Supabase
const { createClient } = require("@supabase/supabase-js");

// Local Supabase Configuration
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testStorage() {
  console.log("🔍 Testing Supabase Storage Configuration\n");

  try {
    // Test 1: List buckets
    console.log("1. Testing bucket access...");
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.log("❌ Cannot list buckets:", bucketError);
    } else {
      console.log(
        "✅ Available buckets:",
        buckets?.map((b) => `${b.id} (${b.public ? "public" : "private"})`) ||
          []
      );
    }

    // Check if menu-items-images bucket exists
    const menuBucket = buckets?.find((b) => b.id === "menu-items-images");
    if (!menuBucket) {
      console.log("\n❌ menu-items-images bucket not found!");
      console.log("Creating bucket...");

      // Create bucket with admin client
      const { data: createData, error: createError } =
        await supabaseAdmin.storage.createBucket("menu-items-images", {
          public: true,
        });

      if (createError) {
        console.log("❌ Failed to create bucket:", createError);
        return;
      } else {
        console.log("✅ Created menu-items-images bucket");
      }
    } else {
      console.log("✅ menu-items-images bucket exists");
    }

    // Test 2: List files in bucket
    console.log("\n2. Testing file listing...");
    const { data: files, error: listError } = await supabase.storage
      .from("menu-items-images")
      .list("", { limit: 10 });

    if (listError) {
      console.log("❌ Cannot list files:", listError);
    } else {
      console.log("✅ Can list files. Count:", files?.length || 0);
    }

    // Test 3: Upload a test file
    console.log("\n3. Testing file upload...");
    const testContent = "This is a test file";
    const testFile = new Blob([testContent], { type: "text/plain" });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("menu-items-images")
      .upload("test/upload-test.txt", testFile, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.log("❌ Upload failed:", uploadError);

      // Try with admin client
      console.log("Trying with admin client...");
      const { data: adminUpload, error: adminError } =
        await supabaseAdmin.storage
          .from("menu-items-images")
          .upload("test/admin-upload-test.txt", testFile, {
            upsert: true,
            cacheControl: "3600",
          });

      if (adminError) {
        console.log("❌ Admin upload also failed:", adminError);
      } else {
        console.log("✅ Admin upload successful");
      }
    } else {
      console.log("✅ Upload successful:", uploadData);

      // Test 4: Get public URL
      const { data: urlData } = supabase.storage
        .from("menu-items-images")
        .getPublicUrl("test/upload-test.txt");

      console.log("✅ Public URL:", urlData.publicUrl);

      // Test 5: Download file to verify
      const { data: downloadData, error: downloadError } =
        await supabase.storage
          .from("menu-items-images")
          .download("test/upload-test.txt");

      if (downloadError) {
        console.log("❌ Download failed:", downloadError);
      } else {
        console.log("✅ Download successful, size:", downloadData?.size);
      }
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error);
  }
}

testStorage();

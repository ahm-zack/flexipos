// Quick test script to verify pie CRUD operations
import { pieClientService } from "./lib/supabase/client-db.js";

async function testPieCRUD() {
  try {
    console.log("🧪 Testing Pie CRUD Operations...\n");

    // Test 1: Get all pies
    console.log("1. Testing getPies()...");
    const allPies = await pieClientService.getPies();
    console.log(`✅ Found ${allPies.length} pies in database`);

    if (allPies.length > 0) {
      const firstPie = allPies[0];
      console.log(
        `   First pie: ${firstPie.nameEn} (${firstPie.type}, ${firstPie.size})`
      );

      // Test 2: Get pie by ID
      console.log("\n2. Testing getPieById()...");
      const pieById = await pieClientService.getPieById(firstPie.id);
      if (pieById) {
        console.log(`✅ Retrieved pie by ID: ${pieById.nameEn}`);
      } else {
        console.log("❌ Failed to retrieve pie by ID");
      }

      // Test 3: Test invalid ID
      console.log("\n3. Testing getPieById() with invalid ID...");
      const invalidPie = await pieClientService.getPieById("invalid-id");
      if (invalidPie === null) {
        console.log("✅ Correctly returned null for invalid ID");
      } else {
        console.log("❌ Should have returned null for invalid ID");
      }
    }

    // Test 4: Create new pie (test insert)
    console.log("\n4. Testing createPie()...");
    const newPieData = {
      type: "Cheese",
      nameAr: "فطيرة الجبن التجريبية",
      nameEn: "Test Cheese Pie",
      size: "small",
      imageUrl: "",
      priceWithVat: "15.50",
      modifiers: [],
    };

    const createdPie = await pieClientService.createPie(newPieData);
    console.log(
      `✅ Created new pie: ${createdPie.nameEn} (ID: ${createdPie.id})`
    );

    // Test 5: Update pie
    console.log("\n5. Testing updatePie()...");
    const updatedPie = await pieClientService.updatePie(createdPie.id, {
      nameEn: "Updated Test Cheese Pie",
      priceWithVat: "16.50",
    });
    console.log(
      `✅ Updated pie: ${updatedPie.nameEn}, Price: ${updatedPie.priceWithVat}`
    );

    // Test 6: Delete pie (cleanup)
    console.log("\n6. Testing deletePie()...");
    await pieClientService.deletePie(createdPie.id);
    console.log("✅ Deleted test pie");

    // Verify deletion
    const deletedPie = await pieClientService.getPieById(createdPie.id);
    if (deletedPie === null) {
      console.log("✅ Confirmed pie was deleted");
    } else {
      console.log("❌ Pie deletion failed");
    }

    console.log("\n🎉 All pie CRUD operations completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testPieCRUD();

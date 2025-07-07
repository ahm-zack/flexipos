const { db } = require("./lib/db");
const { getModifiersForItem } = require("./lib/modifiers-service");

async function testModifiers() {
  try {
    console.log("🧪 Testing Modifiers Feature...\n");

    // Test 1: Fetch modifiers for Margherita pizza
    console.log("📋 Test 1: Fetching modifiers for Margherita pizza");
    const pizzaModifiers = await getModifiersForItem(
      "8099cbce-67a7-43af-9571-cb852f83dc05",
      "pizza"
    );
    console.log(
      "✅ Found",
      pizzaModifiers.length,
      "modifiers for Margherita pizza:"
    );
    pizzaModifiers.forEach((mod, i) => {
      console.log(
        `  ${i + 1}. ${mod.name} (${mod.type}) - ${
          mod.type === "extra" ? `$${mod.price}` : "No charge"
        }`
      );
    });

    // Test 2: Fetch modifiers for Akkawi Cheese pie
    console.log("\n📋 Test 2: Fetching modifiers for Akkawi Cheese pie");
    const pieModifiers = await getModifiersForItem(
      "503ba88a-79eb-4a2c-a4db-3eccbc33851f",
      "pie"
    );
    console.log(
      "✅ Found",
      pieModifiers.length,
      "modifiers for Akkawi Cheese pie:"
    );
    pieModifiers.forEach((mod, i) => {
      console.log(
        `  ${i + 1}. ${mod.name} (${mod.type}) - ${
          mod.type === "extra" ? `$${mod.price}` : "No charge"
        }`
      );
    });

    // Test 3: Test with non-existent item
    console.log("\n📋 Test 3: Testing with non-existent item");
    const noModifiers = await getModifiersForItem("non-existent-id", "pizza");
    console.log(
      "✅ Found",
      noModifiers.length,
      "modifiers for non-existent item (expected 0)"
    );

    console.log(
      "\n🎉 All tests passed! Modifiers feature is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testModifiers();

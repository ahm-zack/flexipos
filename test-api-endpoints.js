#!/usr/bin/env node

const testApiEndpoints = async () => {
  const baseUrl = "http://localhost:3001";

  try {
    console.log("🧪 Testing API endpoints...\n");

    // Test pizzas endpoint
    console.log("📋 Testing /api/pizzas...");
    const pizzasResponse = await fetch(`${baseUrl}/api/pizzas`);
    if (pizzasResponse.ok) {
      const pizzas = await pizzasResponse.json();
      console.log(`✅ Pizzas API working - found ${pizzas.length} pizzas`);
      if (pizzas.length > 0) {
        console.log(`   First pizza: ${pizzas[0].name_en} (${pizzas[0].type})`);
      }
    } else {
      console.log(`❌ Pizzas API error: ${pizzasResponse.status}`);
    }

    // Test pies endpoint
    console.log("\n📋 Testing /api/pies...");
    const piesResponse = await fetch(`${baseUrl}/api/pies`);
    if (piesResponse.ok) {
      const pies = await piesResponse.json();
      console.log(`✅ Pies API working - found ${pies.length} pies`);
      if (pies.length > 0) {
        console.log(`   First pie: ${pies[0].name_en} (${pies[0].type})`);
      }
    } else {
      console.log(`❌ Pies API error: ${piesResponse.status}`);
    }

    console.log("\n🎉 API endpoint test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testApiEndpoints();

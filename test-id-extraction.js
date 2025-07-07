// Simple test to verify ID extraction
const testCases = [
  "011f9d47-28fe-4f54-84d3-c63147a2279e-1751914613539",
  "abcd1234-5678-9012-3456-789012345678-1234567890",
  "550e8400-e29b-41d4-a716-446655440000-1751914613539",
];

console.log("🧪 Testing ID extraction logic:\n");

testCases.forEach((compositeId, index) => {
  const extracted = compositeId.split("-").slice(0, -1).join("-");
  const isValidUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      extracted
    );

  console.log(`Test ${index + 1}:`);
  console.log(`  Input:     ${compositeId}`);
  console.log(`  Extracted: ${extracted}`);
  console.log(`  Valid UUID: ${isValidUUID ? "✅" : "❌"}`);
  console.log("");
});

// Test the specific failing case
const failingCase = "011f9d47-28fe-4f54-84d3-c63147a2279e-1751914613539";
const result = failingCase.split("-").slice(0, -1).join("-");
console.log("🎯 Specific failing case:");
console.log(`Input: ${failingCase}`);
console.log(`Result: ${result}`);
console.log(
  `Should be valid UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    result
  )}`
);

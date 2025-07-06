// Simple test script to verify EOD report generation
// Run this with: node test-eod-report.js

const testEODReport = async () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const startDateTime = yesterday.toISOString();
  const endDateTime = now.toISOString();

  console.log("Testing EOD report generation...");
  console.log("Start:", startDateTime);
  console.log("End:", endDateTime);

  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/reports/eod?preset=yesterday&save=false",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // You'll need to add auth headers here if needed
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ EOD Report generated successfully!");
      console.log("Total Orders:", result.data.totalOrders);
      console.log("Total Revenue:", result.data.totalWithVat);
      console.log("Completion Rate:", result.data.orderCompletionRate + "%");
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
};

testEODReport();

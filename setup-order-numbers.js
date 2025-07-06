/**
 * Script to set up order number sequence in the database
 * This ensures the ORD-0001 format is properly configured
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function setupOrderNumbers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "create-order-number-sequence.sql"
    );
    const migration = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    console.log("Executing order number sequence migration...");
    await client.query(migration);
    console.log("Order number sequence migration completed successfully");

    // Test the function
    console.log("Testing order number generation...");
    const result = await client.query(
      "SELECT generate_order_number() as order_number"
    );
    console.log("Generated order number:", result.rows[0].order_number);
  } catch (error) {
    console.error("Error setting up order numbers:", error);
  } finally {
    await client.end();
  }
}

// Load environment variables
require("dotenv").config();

// Run the setup
setupOrderNumbers();

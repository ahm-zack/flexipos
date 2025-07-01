const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "supabase/migrations/004_create_pies_table.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Running pie table migration...");
    await client.query(migrationSQL);
    console.log("✅ Pie table migration completed successfully!");

    // Check if the table was created
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pies';"
    );
    if (result.rows.length > 0) {
      console.log("✅ Pies table created successfully!");

      // Check if sample data was inserted
      const pieCount = await client.query("SELECT COUNT(*) FROM pies;");
      console.log(`✅ Sample data inserted: ${pieCount.rows[0].count} pies`);
    } else {
      console.log("❌ Pies table was not created");
    }
  } catch (error) {
    console.error("❌ Error running migration:", error.message);
  } finally {
    await client.end();
  }
}

runMigration();

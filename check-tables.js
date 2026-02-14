const { Client } = require("pg");

async function checkTables() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

    console.log("Tables in database:");
    result.rows.forEach((row) => {
      console.log(" -", row.tablename);
    });

    // Check specifically for business vs businesses
    const businessCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'business'
      ) as business_exists,
      EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'businesses'
      ) as businesses_exists;
    `);

    console.log("\nTable existence check:");
    console.log("business (singular):", businessCheck.rows[0].business_exists);
    console.log(
      "businesses (plural):",
      businessCheck.rows[0].businesses_exists,
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

checkTables();

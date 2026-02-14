const { Client } = require("pg");

async function inspectDatabase() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    // Get all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log("=== TABLES ===");
    for (const row of tables.rows) {
      const tableName = row.table_name;
      console.log(`\n--- ${tableName} ---`);

      const columns = await client.query(
        `
        SELECT 
          column_name,
          data_type,
          udt_name,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `,
        [tableName],
      );

      columns.rows.forEach((col) => {
        const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
        const defaultVal = col.column_default
          ? ` DEFAULT ${col.column_default}`
          : "";
        console.log(
          `  ${col.column_name}: ${col.udt_name} ${nullable}${defaultVal}`,
        );
      });
    }

    // Get all enums
    console.log("\n\n=== ENUMS ===");
    const enums = await client.query(`
      SELECT 
        t.typname AS enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    enums.rows.forEach((row) => {
      console.log(
        `${row.enum_name}: [${row.values.map((v) => `'${v}'`).join(", ")}]`,
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

inspectDatabase();

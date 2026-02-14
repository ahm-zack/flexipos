const { Client } = require('pg');

async function checkAndApplyMigrations() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if businesses table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses'
      );
    `);

    console.log('Businesses table exists:', result.rows[0].exists);

    if (!result.rows[0].exists) {
      console.log('🔧 Businesses table does not exist. Please run migrations.');
      console.log('Run: cd /home/zex/projects/flexipos && npx drizzle-kit push');
    } else {
      console.log('✅ Database schema is ready!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAndApplyMigrations();

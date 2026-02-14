import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54323/postgres';
  
  console.log('🔄 Running migrations...');
  console.log('📍 Database:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);
  
  try {
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

runMigrations();

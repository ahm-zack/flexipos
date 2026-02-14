import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    console.log(result);
    
    // Check specifically for businesses table
    const businessCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses'
      );
    `);
    
    console.log('\nBusinesses table exists:', businessCheck);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkTables();

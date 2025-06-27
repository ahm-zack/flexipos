import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create connection using DATABASE_URL for simplicity
function getConnectionString() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return databaseUrl;
}

// Create the connection
const connectionString = getConnectionString();
const client = postgres(connectionString, { max: 1 });

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema
export * from './schema';

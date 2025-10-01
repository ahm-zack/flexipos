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

// Configure postgres client with appropriate settings for different environments
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const client = postgres(connectionString, {
  max: isLocal ? 5 : 1, // More connections for local development
  idle_timeout: isLocal ? 30 : 20,
  connect_timeout: isLocal ? 10 : 30
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema
export * from './schema';

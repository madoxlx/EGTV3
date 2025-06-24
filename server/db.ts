import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize database connection with proper error handling
async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test the connection with a simple query
    await db.execute(sql`SELECT 1`);
    
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}

// Export database getter function
export function getDb() {
  return db;
}

// Export database promise for initialization check
export const dbPromise = initializeDatabase();
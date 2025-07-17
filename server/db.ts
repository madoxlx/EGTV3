import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

// Use Replit's PostgreSQL database
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with timeout settings for external PostgreSQL
export const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 30000, // Increased from 10s to 30s
  idleTimeoutMillis: 60000, // Increased from 30s to 60s
  max: 10, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : 
       DATABASE_URL.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

// Initialize database connection with proper error handling
async function initializeDatabase() {
  try {
    console.log("Testing database connection...");

    // Test the connection with a simple query
    await db.execute(sql`SELECT 1`);

    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}

// Export database getter function
export function getDb() {
  return db;
}

// Export database promise for initialization check
export const dbPromise = initializeDatabase();

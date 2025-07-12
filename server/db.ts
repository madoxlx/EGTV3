import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

// Set fallback DATABASE_URL if not present
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with timeout settings for Azure PostgreSQL
export const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: false, // Disable SSL for self-signed certificate issues
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

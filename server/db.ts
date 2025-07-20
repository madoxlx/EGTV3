import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  max: 20,
  min: 1,
  ssl: databaseUrl?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : databaseUrl?.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});
export const db = drizzle(pool, { schema });

// Initialize database connection with enhanced error handling for external DB
async function initializeDatabase() {
  try {
    console.log("Attempting to connect to external PostgreSQL database...");
    console.log("Database URL:", databaseUrl?.replace(/:[^@]+@/, ":****@")); // Hide password

    // Test the connection with a simple query
    const result = await db.execute(
      sql`SELECT version(), current_database(), current_user`,
    );

    console.log("✅ Database connection established successfully");
    console.log(
      "Connected to database:",
      databaseUrl?.split("/").pop()?.split("?")[0],
    );
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to external database:");

    if (error instanceof Error) {
      if (error.message.includes("pg_hba.conf")) {
        console.error(
          "🔒 Authentication issue: The PostgreSQL server is blocking connections from this IP address.",
        );
        console.error(
          "💡 Solution: Configure pg_hba.conf on the server to allow connections from Replit.",
        );
      } else if (error.message.includes("timeout")) {
        console.error(
          "⏱️  Connection timeout: The database server may be unreachable or overloaded.",
        );
      } else if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")
      ) {
        console.error(
          "🌐 Network issue: Cannot reach the database server at the specified host/port.",
        );
      } else {
        console.error("Error details:", error.message);
      }
    }

    console.error("📝 Please check:");
    console.error("   1. Database server is running and accessible");
    console.error("   2. Firewall allows connections from external IPs");
    console.error("   3. pg_hba.conf includes entry for external connections");
    console.error("   4. Credentials are correct");

    return false;
  }
}

// Export database getter function
export function getDb() {
  return db;
}

// Export database promise for initialization check
export const dbPromise = initializeDatabase();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

const sql = postgres(databaseUrl);
const db = drizzle(sql);

console.log("🚀 Adding room_distribution_order column to packages table...");

async function addRoomDistributionOrderColumn() {
  try {
    // Add room_distribution_order column to packages table
    await sql`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS room_distribution_order INTEGER DEFAULT 1
    `;
    
    console.log("✅ Successfully added room_distribution_order column");
    
    // Update existing packages to have the default value
    const result = await sql`
      UPDATE packages 
      SET room_distribution_order = 1 
      WHERE room_distribution_order IS NULL
    `;
    
    console.log(`✅ Updated ${result.count} existing packages with default room_distribution_order value`);
    
    // Verify the column was added
    const columns = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name = 'room_distribution_order'
    `;
    
    if (columns.length > 0) {
      console.log("✅ Column verification successful:", columns[0]);
    } else {
      console.log("❌ Column verification failed - column not found");
    }
    
  } catch (error) {
    console.error("❌ Error adding room_distribution_order column:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

addRoomDistributionOrderColumn().catch(console.error);
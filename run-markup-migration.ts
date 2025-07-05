import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function runMarkupMigration() {
  try {
    console.log("🔄 Starting markup_type column migration...");
    
    // Add markup_type column to packages table
    await db.execute(sql`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS markup_type TEXT DEFAULT 'percentage'
    `);
    
    console.log("✅ Successfully added markup_type column");
    
    // Set default values for existing packages
    await db.execute(sql`
      UPDATE packages 
      SET markup_type = 'percentage' 
      WHERE markup_type IS NULL
    `);
    
    console.log("✅ Updated existing packages with default markup_type");
    
    // Verify the migration
    const result = await db.execute(sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name = 'markup_type'
    `);
    
    console.log("✅ Migration verification:", result.rows);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    console.log("🔄 Migration complete");
    process.exit(0);
  }
}

// Run the migration
runMarkupMigration().catch(console.error);
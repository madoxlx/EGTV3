import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

/**
 * Add included_features and excluded_features columns to packages table
 */
async function addIncludedExcludedFeaturesColumns() {
  console.log('🔧 Adding included_features and excluded_features columns to packages table...');
  
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const client = neon(DATABASE_URL);
    const db = drizzle(client);

    // Check if included_features column exists
    const includedFeaturesCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name = 'included_features'
    `);
    
    if (includedFeaturesCheck.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE packages 
        ADD COLUMN included_features JSONB DEFAULT '[]'
      `);
      console.log('✅ Added included_features column to packages table');
    } else {
      console.log('ℹ️ Column included_features already exists in packages table');
    }

    // Check if excluded_features column exists
    const excludedFeaturesCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name = 'excluded_features'
    `);
    
    if (excludedFeaturesCheck.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE packages 
        ADD COLUMN excluded_features JSONB DEFAULT '[]'
      `);
      console.log('✅ Added excluded_features column to packages table');
    } else {
      console.log('ℹ️ Column excluded_features already exists in packages table');
    }
    
    console.log('🎉 Packages table schema update completed successfully');
    
  } catch (error) {
    console.error('❌ Error updating packages table schema:', error);
    process.exit(1);
  }
}

// Run the migration
addIncludedExcludedFeaturesColumns();
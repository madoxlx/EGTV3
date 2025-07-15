import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

// Set fallback DATABASE_URL if not present (same as server/db.ts)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable";

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: false, // Disable SSL for self-signed certificate issues
});

const db = drizzle(pool);

/**
 * Add third feature fields to homepage_sections table
 * This migration adds feature3_title, feature3_description, feature3_icon
 * and their Arabic translations to support 3-feature "Why Choose Us" sections
 */
async function addThirdFeatureToHomepageSections() {
  try {
    console.log('🔄 Adding third feature fields to homepage_sections table...');

    // Add the new feature3 columns with default values
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN IF NOT EXISTS feature3_title TEXT DEFAULT 'Transparent Pricing'
    `);
    
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN IF NOT EXISTS feature3_description TEXT DEFAULT 'Competitive prices with no hidden fees'
    `);
    
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN IF NOT EXISTS feature3_icon TEXT DEFAULT 'star'
    `);
    
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN IF NOT EXISTS feature3_title_ar TEXT
    `);
    
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN IF NOT EXISTS feature3_description_ar TEXT
    `);

    console.log('✅ Successfully added third feature fields to homepage_sections table');

    // Update existing records to have default values for the new fields
    const updateResult = await db.execute(sql`
      UPDATE homepage_sections 
      SET 
        feature3_title = COALESCE(feature3_title, 'Transparent Pricing'),
        feature3_description = COALESCE(feature3_description, 'Competitive prices with no hidden fees'),
        feature3_icon = COALESCE(feature3_icon, 'star')
      WHERE feature3_title IS NULL OR feature3_description IS NULL OR feature3_icon IS NULL
    `);

    console.log(`✅ Updated existing records with default feature3 values`);

    // Check the final structure
    const columns = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'homepage_sections' 
      AND column_name LIKE 'feature3%'
      ORDER BY column_name
    `);

    console.log('📋 New feature3 columns added:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default}, nullable: ${col.is_nullable})`);
    });

    console.log('🎉 Third feature migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding third feature fields:', error);
    throw error;
  }
}

// Run the migration
addThirdFeatureToHomepageSections()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
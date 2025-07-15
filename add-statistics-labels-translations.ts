import { db } from './server/db';
import { sql } from 'drizzle-orm';

/**
 * Add statistics labels translation fields to homepage_sections table
 */
async function addStatisticsLabelsTranslations() {
  try {
    console.log('Adding statistics labels translation fields to homepage_sections table...');
    
    // Add the new columns to the homepage_sections table
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN IF NOT EXISTS tourists_label TEXT DEFAULT 'Tourists',
      ADD COLUMN IF NOT EXISTS destinations_label TEXT DEFAULT 'Destinations',
      ADD COLUMN IF NOT EXISTS hotels_label TEXT DEFAULT 'Hotels',
      ADD COLUMN IF NOT EXISTS tourists_label_ar TEXT DEFAULT 'السياح',
      ADD COLUMN IF NOT EXISTS destinations_label_ar TEXT DEFAULT 'الوجهات',
      ADD COLUMN IF NOT EXISTS hotels_label_ar TEXT DEFAULT 'الفنادق'
    `);
    
    console.log('✅ Successfully added statistics labels translation fields to homepage_sections table');
    
    // Verify the columns were added
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'homepage_sections' 
      AND column_name IN ('tourists_label', 'destinations_label', 'hotels_label', 'tourists_label_ar', 'destinations_label_ar', 'hotels_label_ar')
      ORDER BY column_name
    `);
    
    console.log('New columns added:', result.rows);
    
  } catch (error) {
    console.error('❌ Error adding statistics labels translation fields:', error);
    throw error;
  }
}

// Run the migration
addStatisticsLabelsTranslations()
  .then(() => {
    console.log('✅ Statistics labels translation fields migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

export { addStatisticsLabelsTranslations };
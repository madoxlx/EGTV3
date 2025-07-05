import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function addMarkupTypeColumn() {
  try {
    console.log('Adding markup_type column to packages table...');
    
    // Add markup_type column to packages table
    await db.execute(sql`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS markup_type TEXT DEFAULT 'percentage'
    `);
    
    console.log('✅ Successfully added markup_type column to packages table');
    
    // Set default values for existing packages
    await db.execute(sql`
      UPDATE packages 
      SET markup_type = 'percentage' 
      WHERE markup_type IS NULL
    `);
    
    console.log('✅ Set default markup_type values for existing packages');
    
  } catch (error) {
    console.error('❌ Error adding markup_type column:', error);
    throw error;
  }
}

if (require.main === module) {
  addMarkupTypeColumn().catch(console.error);
}

export { addMarkupTypeColumn };
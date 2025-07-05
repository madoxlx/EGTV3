import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

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
    
    // Check if column was added successfully
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'packages' AND column_name = 'markup_type'
    `);
    
    console.log('✅ Column verification:', result.rows);
    
  } catch (error) {
    console.error('❌ Error adding markup_type column:', error);
    throw error;
  }
}

addMarkupTypeColumn().catch(console.error);
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

async function addMarkupTypeColumn() {
  try {
    console.log('Adding markupType column to packages table...');
    
    // Add markupType column to packages table
    await db.execute(sql`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS markup_type TEXT
    `);
    
    console.log('Successfully added markupType column to packages table');
    
    // Set default values for existing packages
    await db.execute(sql`
      UPDATE packages 
      SET markup_type = 'percentage' 
      WHERE markup_type IS NULL
    `);
    
    console.log('Set default markup_type values for existing packages');
    
  } catch (error) {
    console.error('Error adding markupType column:', error);
    throw error;
  } catch (error) {
    console.error('Error in database operation:', error);
    throw error;
  }
}

addMarkupTypeColumn().catch(console.error);
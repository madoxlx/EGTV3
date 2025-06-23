import { getDb, dbPromise } from './server/db';
import { tours } from './shared/schema';

async function addActiveColumnToTours() {
  try {
    console.log('🔧 Waiting for database connection...');
    await dbPromise;
    
    const db = getDb();
    console.log('🔧 Adding active column to tours table...');
    
    // Check if the column already exists
    const result = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tours' AND column_name = 'active'
    `);
    
    if (result.length > 0) {
      console.log('✅ Active column already exists in tours table');
      return;
    }
    
    // Add the active column
    await db.execute(`
      ALTER TABLE tours 
      ADD COLUMN active BOOLEAN DEFAULT true
    `);
    
    console.log('✅ Active column added to tours table successfully');
    
    // Update existing tours to have active = true
    await db.execute(`
      UPDATE tours 
      SET active = true 
      WHERE active IS NULL
    `);
    
    console.log('✅ Updated existing tours to have active = true');
    
  } catch (error) {
    console.error('❌ Error adding active column to tours table:', error);
    throw error;
  }
}

// Run the migration
addActiveColumnToTours()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 
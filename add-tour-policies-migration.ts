import { sql } from "drizzle-orm";
import { db } from "./server/db";

async function addTourPolicyColumns() {
  console.log('Adding cancellation_policy and terms_and_conditions columns to tours table...');
  
  try {
    // Add cancellation_policy column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE tours 
      ADD COLUMN IF NOT EXISTS cancellation_policy TEXT
    `);
    
    // Add terms_and_conditions column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE tours 
      ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT
    `);
    
    console.log('✅ Successfully added policy columns to tours table');
    
    // Verify the columns were added
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tours' 
      AND column_name IN ('cancellation_policy', 'terms_and_conditions')
    `);
    
    console.log('Verification - Found columns:', result.rows);
    
  } catch (error) {
    console.error('❌ Error adding policy columns:', error);
    throw error;
  }
}

addTourPolicyColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
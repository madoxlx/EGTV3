import { db } from './server/db';
import { sql } from 'drizzle-orm';

/**
 * Fix users table by adding missing phone_number column
 * This script adds the missing column to sync the database with the schema
 */
async function fixUsersPhoneNumberColumn() {
  console.log('🔧 Starting users table phone_number column fix...');
  
  try {
    // Check if phone_number column already exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone_number'
    `);
    
    if (checkResult.length > 0) {
      console.log('✅ phone_number column already exists in users table');
      return;
    }
    
    // Add the missing phone_number column
    console.log('📝 Adding phone_number column to users table...');
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN phone_number TEXT
    `);
    
    console.log('✅ Successfully added phone_number column to users table');
    
    // Verify the column was added
    const verifyResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone_number'
    `);
    
    if (verifyResult.length > 0) {
      console.log('✅ Verification successful: phone_number column is now present');
    } else {
      console.log('❌ Verification failed: phone_number column was not added');
    }
    
  } catch (error) {
    console.error('❌ Error fixing users table phone_number column:', error);
    throw error;
  }
}

// Run the fix
fixUsersPhoneNumberColumn()
  .then(() => {
    console.log('🎉 Users table phone_number column fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix users table phone_number column:', error);
    process.exit(1);
  });
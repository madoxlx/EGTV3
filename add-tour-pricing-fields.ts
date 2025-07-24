import { db } from './server/db.js';

async function addTourPricingFields() {
  try {
    console.log('Adding missing columns to tours table...');
    
    // Add max_capacity column
    await db.execute(`
      ALTER TABLE tours ADD COLUMN IF NOT EXISTS max_capacity INTEGER;
    `);
    
    // Add adult/child/infant pricing columns
    await db.execute(`
      ALTER TABLE tours ADD COLUMN IF NOT EXISTS adult_price DECIMAL(10,2);
    `);
    
    await db.execute(`
      ALTER TABLE tours ADD COLUMN IF NOT EXISTS child_price DECIMAL(10,2);
    `);
    
    await db.execute(`
      ALTER TABLE tours ADD COLUMN IF NOT EXISTS infant_price DECIMAL(10,2);
    `);
    
    console.log('Successfully added tour pricing columns:');
    console.log('- max_capacity (INTEGER)');
    console.log('- adult_price (DECIMAL)');
    console.log('- child_price (DECIMAL)');
    console.log('- infant_price (DECIMAL)');
    
  } catch (error) {
    console.error('Error adding tour pricing fields:', error);
  } finally {
    process.exit(0);
  }
}

addTourPricingFields();
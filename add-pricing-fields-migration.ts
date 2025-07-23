import { db } from './server/db';

async function addPricingFields() {
  try {
    console.log('Adding pricing fields to rooms table...');
    
    // Add the new pricing fields to the rooms table
    await db.execute(`
      ALTER TABLE rooms 
      ADD COLUMN IF NOT EXISTS adult_price INTEGER,
      ADD COLUMN IF NOT EXISTS child_price INTEGER,
      ADD COLUMN IF NOT EXISTS infant_price INTEGER,
      ADD COLUMN IF NOT EXISTS pricing_rule VARCHAR(20) DEFAULT 'per_room'
    `);
    
    console.log('✅ Pricing fields added successfully!');
    
    // Verify the changes
    const result = await db.execute(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'rooms' 
      AND column_name IN ('adult_price', 'child_price', 'infant_price', 'pricing_rule')
      ORDER BY column_name
    `);
    
    console.log('New columns:', result.rows);
    
  } catch (error) {
    console.error('Error adding pricing fields:', error);
    throw error;
  }
}

// Run the migration
addPricingFields()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
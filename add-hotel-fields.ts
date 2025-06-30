import { pool } from "./server/db";

async function addHotelFields() {
  const client = await pool.connect();
  
  try {
    console.log('Adding missing fields to hotels table...');
    
    // Add restaurants column
    await client.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS restaurants JSONB;
    `);
    console.log('✅ Added restaurants column');
    
    // Add landmarks column
    await client.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS landmarks JSONB;
    `);
    console.log('✅ Added landmarks column');
    
    // Add faqs column
    await client.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS faqs JSONB;
    `);
    console.log('✅ Added faqs column');
    
    // Add room_types column
    await client.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS room_types JSONB;
    `);
    console.log('✅ Added room_types column');
    
    console.log('✅ All hotel fields added successfully!');
    
  } catch (error) {
    console.error('Error adding hotel fields:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addHotelFields().catch(console.error);
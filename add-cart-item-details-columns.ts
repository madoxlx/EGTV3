import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb';

async function addCartItemDetailsColumns() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Add the missing columns to cart_items table
    console.log('⚠️ Adding itemName and itemDetails columns to cart_items...');
    
    // Add itemName column
    await client.query(`
      ALTER TABLE cart_items 
      ADD COLUMN IF NOT EXISTS item_name TEXT
    `);
    
    // Add itemDetails column  
    await client.query(`
      ALTER TABLE cart_items 
      ADD COLUMN IF NOT EXISTS item_details JSONB
    `);
    
    console.log('✅ Successfully added itemName and itemDetails columns to cart_items table');
    console.log('✅ Cart items can now store complete package details');
    
  } catch (error) {
    console.error('❌ Error adding cart item details columns:', error);
  } finally {
    await client.end();
  }
}

addCartItemDetailsColumns();
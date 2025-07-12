import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable';

const client = postgres(databaseUrl, { ssl: false });
const db = drizzle(client);

async function addFinalMissingColumnsToHotels() {
  try {
    console.log('🔧 Adding final missing columns to hotels table...');
    
    // Get current columns in hotels table
    const currentColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    const columnNames = currentColumns.map(col => col.column_name);
    console.log('Current columns count:', columnNames.length);
    
    // List of remaining columns that should exist
    const requiredColumns = [
      { name: 'postal_code', type: 'TEXT' },
      { name: 'longitude', type: 'DECIMAL' },
      { name: 'latitude', type: 'DECIMAL' },
      { name: 'featured', type: 'BOOLEAN DEFAULT false' },
      { name: 'rating', type: 'DECIMAL' },
      { name: 'status', type: 'TEXT DEFAULT \'active\'' },
      { name: 'stars', type: 'INTEGER' },
      { name: 'currency', type: 'TEXT DEFAULT \'EGP\'' },
      { name: 'pet_friendly', type: 'BOOLEAN DEFAULT false' },
      { name: 'airport_transfer_available', type: 'BOOLEAN DEFAULT false' },
      { name: 'restaurants', type: 'JSONB' },
      { name: 'landmarks', type: 'JSONB' },
      { name: 'faqs', type: 'JSONB' },
      { name: 'room_types', type: 'JSONB' }
    ];
    
    // Add missing columns
    for (const column of requiredColumns) {
      if (!columnNames.includes(column.name)) {
        console.log(`➕ Adding column: ${column.name}`);
        await db.execute(sql.raw(`
          ALTER TABLE hotels 
          ADD COLUMN ${column.name} ${column.type}
        `));
        console.log(`✅ Added ${column.name} column`);
      } else {
        console.log(`⏭️  Column ${column.name} already exists`);
      }
    }
    
    // Verify all columns were added
    const updatedColumns = await db.execute(sql`
      SELECT COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    console.log('✅ Total columns in hotels table:', updatedColumns[0].column_count);
    
  } catch (error) {
    console.error('❌ Error adding final missing columns:', error);
    throw error;
  }
}

addFinalMissingColumnsToHotels()
  .then(() => {
    console.log('🎉 Hotels table schema update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update hotels table schema:', error);
    process.exit(1);
  });
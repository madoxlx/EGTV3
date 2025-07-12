import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable';

const client = postgres(databaseUrl, { ssl: false });
const db = drizzle(client);

async function addMissingColumnsToHotels() {
  try {
    console.log('🔧 Adding missing columns to hotels table...');
    
    // Get current columns in hotels table
    const currentColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    const columnNames = currentColumns.map(col => col.column_name);
    console.log('Current columns:', columnNames);
    
    // List of columns that should exist
    const requiredColumns = [
      { name: 'city', type: 'TEXT' },
      { name: 'country', type: 'TEXT' },
      { name: 'short_description', type: 'TEXT' },
      { name: 'base_price', type: 'DECIMAL' },
      { name: 'amenities', type: 'JSONB' },
      { name: 'guest_rating', type: 'DECIMAL' },
      { name: 'verification_status', type: 'TEXT DEFAULT \'pending\'' },
      { name: 'car_rental_available', type: 'BOOLEAN DEFAULT false' },
      { name: 'shuttle_available', type: 'BOOLEAN DEFAULT false' },
      { name: 'created_by', type: 'INTEGER' },
      { name: 'languages', type: 'JSONB DEFAULT \'["en"]\'' }
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
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
      ORDER BY column_name
    `);
    
    console.log('✅ Final columns in hotels table:');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding missing columns:', error);
    throw error;
  }
}

addMissingColumnsToHotels()
  .then(() => {
    console.log('🎉 Hotels table schema update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update hotels table schema:', error);
    process.exit(1);
  });
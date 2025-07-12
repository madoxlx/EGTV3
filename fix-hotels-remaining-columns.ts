import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable';
const client = postgres(databaseUrl, { ssl: false });
const db = drizzle(client);

async function addRemainingColumnsToHotels() {
  try {
    console.log('🔧 Adding remaining columns to hotels table...');
    
    const currentColumns = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    const columnNames = currentColumns.map(col => col.column_name);
    
    const requiredColumns = [
      { name: 'review_count', type: 'INTEGER DEFAULT 0' },
      { name: 'active', type: 'BOOLEAN DEFAULT true' },
      { name: 'max_occupancy', type: 'INTEGER' },
      { name: 'min_stay', type: 'INTEGER' },
      { name: 'max_stay', type: 'INTEGER' },
      { name: 'cancellation_policy', type: 'TEXT' },
      { name: 'check_in_age', type: 'INTEGER' },
      { name: 'tags', type: 'JSONB' },
      { name: 'policies', type: 'JSONB' },
      { name: 'sustainability', type: 'JSONB' }
    ];
    
    for (const column of requiredColumns) {
      if (!columnNames.includes(column.name)) {
        console.log(`➕ Adding column: ${column.name}`);
        await db.execute(sql.raw(`
          ALTER TABLE hotels ADD COLUMN ${column.name} ${column.type}
        `));
        console.log(`✅ Added ${column.name} column`);
      } else {
        console.log(`⏭️  Column ${column.name} already exists`);
      }
    }
    
    const finalCount = await db.execute(sql`
      SELECT COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    console.log('✅ Total columns in hotels table:', finalCount[0].column_count);
    
  } catch (error) {
    console.error('❌ Error adding remaining columns:', error);
    throw error;
  }
}

addRemainingColumnsToHotels()
  .then(() => {
    console.log('🎉 Hotels table schema fully updated');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update hotels table schema:', error);
    process.exit(1);
  });
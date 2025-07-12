import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable';

const client = postgres(databaseUrl, { ssl: false });
const db = drizzle(client);

async function addCategoryIdToHotels() {
  try {
    console.log('🔧 Adding category_id column to hotels table...');
    
    // Check if column already exists
    const columnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hotels' 
      AND column_name = 'category_id'
    `);
    
    if (columnExists.length > 0) {
      console.log('✅ category_id column already exists in hotels table');
      return;
    }
    
    // Add the column
    await db.execute(sql`
      ALTER TABLE hotels 
      ADD COLUMN category_id INTEGER
    `);
    
    console.log('✅ Successfully added category_id column to hotels table');
    
    // Check if hotel_categories table exists
    const categoriesTableExists = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hotel_categories'
    `);
    
    if (categoriesTableExists.length > 0) {
      try {
        // Add foreign key constraint
        await db.execute(sql`
          ALTER TABLE hotels 
          ADD CONSTRAINT fk_hotels_category_id 
          FOREIGN KEY (category_id) REFERENCES hotel_categories(id)
        `);
        console.log('✅ Added foreign key constraint to hotel_categories');
      } catch (error) {
        console.log('⚠️  Could not add foreign key constraint:', error.message);
      }
    } else {
      console.log('ℹ️  hotel_categories table does not exist, skipping foreign key');
    }
    
    // Verify the column was added
    const verifyColumn = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'hotels' 
      AND column_name = 'category_id'
    `);
    
    console.log('✅ Column verification:', verifyColumn);
    
  } catch (error) {
    console.error('❌ Error adding category_id column:', error);
    throw error;
  }
}

addCategoryIdToHotels()
  .then(() => {
    console.log('🎉 Hotels table schema update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update hotels table schema:', error);
    process.exit(1);
  });
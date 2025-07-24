import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb';

async function fixHomepageSectionsOrderColumn() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if order column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'homepage_sections' AND column_name = 'order'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('⚠️ Order column missing, adding it...');
      
      // Add the missing order column
      await client.query(`
        ALTER TABLE homepage_sections 
        ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
      `);
      
      console.log('✅ Order column added successfully');
    } else {
      console.log('✅ Order column already exists');
    }

    // Update existing records to have proper order values
    await client.query(`
      UPDATE homepage_sections 
      SET "order" = id 
      WHERE "order" IS NULL OR "order" = 0
    `);

    console.log('✅ Updated existing records with order values');
    
  } catch (error) {
    console.error('❌ Error fixing homepage_sections order column:', error);
  } finally {
    await client.end();
  }
}

fixHomepageSectionsOrderColumn();
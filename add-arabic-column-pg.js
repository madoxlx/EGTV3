#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;

async function addArabicTitleColumn() {
  const client = new Client({
    connectionString: 'postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb'
  });
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    console.log('Adding title_ar column to menu_items table...');
    
    // Add the Arabic title column if it doesn't exist
    await client.query(`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS title_ar TEXT
    `);
    
    console.log('✅ Successfully added title_ar column to menu_items table');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items' 
      AND column_name = 'title_ar'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verification successful: title_ar column exists');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('❌ Verification failed: title_ar column not found');
    }
    
  } catch (error) {
    console.error('❌ Error adding title_ar column:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addArabicTitleColumn();
#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function addArabicTitleColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Adding title_ar column to menu_items table...');
    
    // Add the Arabic title column if it doesn't exist
    await sql`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS title_ar TEXT
    `;
    
    console.log('✅ Successfully added title_ar column to menu_items table');
    
    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items' 
      AND column_name = 'title_ar'
    `;
    
    if (result.length > 0) {
      console.log('✅ Verification successful: title_ar column exists');
      console.log('Column details:', result[0]);
    } else {
      console.log('❌ Verification failed: title_ar column not found');
    }
    
  } catch (error) {
    console.error('❌ Error adding title_ar column:', error);
    process.exit(1);
  }
}

addArabicTitleColumn();
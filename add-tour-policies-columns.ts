import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function addTourPoliciesColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tours' 
      AND (column_name = 'cancellation_policy' OR column_name = 'terms_and_conditions')
    `);

    if (checkColumns.rows.length === 0) {
      // Add the new columns
      await client.query(`
        ALTER TABLE tours 
        ADD COLUMN cancellation_policy TEXT,
        ADD COLUMN terms_and_conditions TEXT
      `);
      
      console.log('✅ Successfully added cancellation_policy and terms_and_conditions columns to tours table');
    } else {
      console.log('ℹ️ Columns already exist, skipping migration');
    }

  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await client.end();
  }
}

addTourPoliciesColumns();
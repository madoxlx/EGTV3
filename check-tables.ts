import { pool } from './server/db';

async function checkTables() {
  try {
    const client = await pool.connect();
    
    // Check which tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('translations', 'tour_categories', 'menu_items', 'site_language_settings', 'package_categories')
      ORDER BY table_name;
    `);
    
    console.log('Existing tables:', tables.rows);
    
    // Check translations table structure
    if (tables.rows.some(row => row.table_name === 'translations')) {
      const translationsData = await client.query('SELECT * FROM translations LIMIT 3');
      console.log('Sample translations:', translationsData.rows);
    }
    
    client.release();
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
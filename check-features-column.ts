import { pool } from "./server/db";

/**
 * Check if features column exists in hotels table
 */

async function checkFeaturesColumn() {
  console.log('🔍 Checking features column in hotels table');
  console.log('===========================================');

  const client = await pool.connect();
  
  try {
    // Check if features column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'hotels' 
      AND column_name = 'features'
    `);

    if (columnCheck.rows.length > 0) {
      const column = columnCheck.rows[0];
      console.log('✅ Features column exists!');
      console.log('- Column name:', column.column_name);
      console.log('- Data type:', column.data_type);
      console.log('- Is nullable:', column.is_nullable);
      console.log('- Default value:', column.column_default);
    } else {
      console.log('❌ Features column does NOT exist');
      
      // Show all columns in hotels table
      console.log('\n📋 Available columns in hotels table:');
      const allColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'hotels'
        ORDER BY ordinal_position
      `);
      
      allColumns.rows.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
      });
    }

    // Test query to see if we can select features
    console.log('\n🧪 Testing features column query...');
    try {
      const testQuery = await client.query(`
        SELECT id, name, features 
        FROM hotels 
        WHERE features IS NOT NULL 
        LIMIT 3
      `);
      
      console.log('✅ Features query successful');
      console.log(`- Found ${testQuery.rows.length} hotels with features`);
      
      if (testQuery.rows.length > 0) {
        testQuery.rows.forEach((hotel, index) => {
          console.log(`\nHotel ${index + 1}:`);
          console.log(`- ID: ${hotel.id}`);
          console.log(`- Name: ${hotel.name}`);
          console.log(`- Features: ${JSON.stringify(hotel.features, null, 2)}`);
        });
      }
    } catch (queryError) {
      console.log('❌ Features query failed:', queryError.message);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    client.release();
  }
}

// Run the check
checkFeaturesColumn().catch(console.error);
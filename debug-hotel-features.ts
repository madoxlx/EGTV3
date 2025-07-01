import { pool } from "./server/db";

/**
 * Debug script to check what's actually in the database for hotel ID 74
 * (The hotel created by the API test that returned empty features)
 */

async function debugHotelFeatures() {
  console.log('🔍 Debugging Hotel Features in Database');
  console.log('=====================================');

  const client = await pool.connect();
  
  try {
    // Check hotel ID 74 (created by API test)
    const result = await client.query(`
      SELECT id, name, features 
      FROM hotels 
      WHERE id = 74
    `);

    if (result.rows.length === 0) {
      console.log('❌ Hotel ID 74 not found in database');
      return;
    }

    const hotel = result.rows[0];
    console.log('🏨 Hotel found in database:');
    console.log('  ID:', hotel.id);
    console.log('  Name:', hotel.name);
    console.log('  Features type:', typeof hotel.features);
    console.log('  Features value:', hotel.features);
    console.log('  Features JSON:', JSON.stringify(hotel.features, null, 2));
    
    if (Array.isArray(hotel.features)) {
      console.log('  Features is array:', true);
      console.log('  Features length:', hotel.features.length);
      
      if (hotel.features.length > 0) {
        console.log('  ✅ Features are present in database!');
        hotel.features.forEach((feature: any, index: number) => {
          console.log(`    Feature ${index + 1}:`, feature);
        });
      } else {
        console.log('  ❌ Features array is empty in database');
      }
    } else {
      console.log('  ❌ Features is not an array in database');
    }

    // Also check the most recent hotel
    const recentResult = await client.query(`
      SELECT id, name, features 
      FROM hotels 
      ORDER BY id DESC 
      LIMIT 3
    `);

    console.log('\n📊 Most recent hotels in database:');
    recentResult.rows.forEach((hotel: any, index: number) => {
      console.log(`  Hotel ${index + 1}: ID ${hotel.id}, Name: "${hotel.name}"`);
      console.log(`    Features: ${Array.isArray(hotel.features) ? `[${hotel.features.length} items]` : hotel.features}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
  }
}

// Run the debug
debugHotelFeatures().catch(console.error);
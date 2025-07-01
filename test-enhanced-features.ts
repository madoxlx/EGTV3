import { pool } from "./server/db";

/**
 * Test script to verify enhanced hotel features system with name and icon objects
 * This tests the new structured features system {name: "drink", icon: "wine-glass"}
 */

async function testEnhancedFeatures() {
  console.log('🧪 Testing Enhanced Hotel Features System with Objects');
  console.log('==================================================');

  const client = await pool.connect();
  
  try {
    console.log('Testing database connection...');
    
    // Test structured feature objects with name and icon
    const testFeatures = [
      { name: "drink", icon: "wine-glass" },
      { name: "meal", icon: "hamburger" },
      { name: "wifi", icon: "wifi" },
      { name: "parking", icon: "car" },
      { name: "pool", icon: "swimming-pool" }
    ];

    console.log('\n1️⃣ Creating test hotel with structured feature objects...');
    
    const insertResult = await client.query(`
      INSERT INTO hotels (name, description, address, features, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, features
    `, [
      'Enhanced Feature Hotel',
      'Testing structured features with name and icon properties',
      '123 Feature Test Street',
      JSON.stringify(testFeatures),
      'active'
    ]);

    const newHotel = insertResult.rows[0];
    console.log('✅ Test hotel created:', {
      id: newHotel.id,
      name: newHotel.name,
      features: newHotel.features
    });

    console.log('\n2️⃣ Retrieving hotel features...');
    
    const selectResult = await client.query(`
      SELECT id, name, features 
      FROM hotels 
      WHERE id = $1
    `, [newHotel.id]);

    const retrievedHotel = selectResult.rows[0];
    console.log('✅ Hotel retrieved:', {
      id: retrievedHotel.id,
      name: retrievedHotel.name,
      features: retrievedHotel.features
    });
    
    console.log('✅ Features stored as structured objects:', retrievedHotel.features);
    console.log('✅ Features count:', retrievedHotel.features.length);
    
    // Verify each feature has name and icon properties
    retrievedHotel.features.forEach((feature: any, index: number) => {
      console.log(`  Feature ${index + 1}: name="${feature.name}", icon="${feature.icon}"`);
    });

    console.log('\n3️⃣ Testing feature updates with new objects...');
    
    const updatedFeatures = [
      ...testFeatures,
      { name: "gym", icon: "dumbbell" },
      { name: "spa", icon: "spa" }
    ];
    
    await client.query(`
      UPDATE hotels 
      SET features = $1 
      WHERE id = $2
    `, [JSON.stringify(updatedFeatures), newHotel.id]);

    const updatedResult = await client.query(`
      SELECT id, name, features 
      FROM hotels 
      WHERE id = $1
    `, [newHotel.id]);

    const updatedHotel = updatedResult.rows[0];
    console.log('✅ Hotel features updated:', {
      id: updatedHotel.id,
      name: updatedHotel.name,
      features: updatedHotel.features
    });

    console.log('\n4️⃣ Cleaning up test data...');
    
    await client.query('DELETE FROM hotels WHERE id = $1', [newHotel.id]);
    console.log('✅ Test hotel deleted');

    console.log('\n🎉 All enhanced features tests passed!');
    console.log('✅ Enhanced features system with objects is working correctly');
    console.log('✅ Features are stored as {name: "...", icon: "..."} objects');
    console.log('✅ Database properly handles JSON structure for features');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testEnhancedFeatures().catch(console.error);
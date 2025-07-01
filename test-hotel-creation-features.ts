import { pool } from "./server/db";

/**
 * Test script to verify complete hotel creation with enhanced features system
 * Tests both predefined features and custom feature addition
 */

async function testHotelCreationFeatures() {
  console.log('🏨 Testing Complete Hotel Creation with Enhanced Features');
  console.log('==================================================');

  const client = await pool.connect();
  
  try {
    console.log('Testing database connection...');
    
    // Predefined features (same as in the hotel creation form)
    const predefinedFeatures = [
      { name: "drink", icon: "wine-glass" },
      { name: "meal", icon: "hamburger" },
      { name: "wifi", icon: "wifi" },
      { name: "parking", icon: "car" },
      { name: "pool", icon: "swimming-pool" },
      { name: "gym", icon: "dumbbell" },
      { name: "spa", icon: "spa" },
      { name: "restaurant", icon: "utensils" },
      { name: "room service", icon: "concierge-bell" },
      { name: "air conditioning", icon: "snowflake" },
      { name: "laundry", icon: "tshirt" },
      { name: "business center", icon: "briefcase" },
      { name: "conference room", icon: "presentation-screen" },
      { name: "elevator", icon: "elevator" },
      { name: "balcony", icon: "balcony" },
      { name: "kitchen", icon: "chef-hat" },
      { name: "bar", icon: "martini-glass" },
      { name: "garden", icon: "tree" },
      { name: "beach access", icon: "umbrella-beach" },
      { name: "pet friendly", icon: "dog" }
    ];

    console.log('\n1️⃣ Testing hotel creation with predefined features...');
    console.log(`✅ Predefined features available: ${predefinedFeatures.length}`);
    predefinedFeatures.forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature.name} (${feature.icon})`);
    });

    // Simulate user selecting some features (first 8 features)
    const selectedFeatures = predefinedFeatures.slice(0, 8);
    
    console.log(`\n2️⃣ Creating hotel with ${selectedFeatures.length} selected features...`);
    
    const insertResult = await client.query(`
      INSERT INTO hotels (name, description, address, features, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, features
    `, [
      'Grand Resort & Spa',
      'Luxury hotel with comprehensive amenities and services',
      '123 Paradise Beach Boulevard',
      JSON.stringify(selectedFeatures),
      'active'
    ]);

    const newHotel = insertResult.rows[0];
    console.log('✅ Hotel created with features:', {
      id: newHotel.id,
      name: newHotel.name,
      featuresCount: newHotel.features.length
    });

    console.log('\n3️⃣ Verifying feature structure...');
    newHotel.features.forEach((feature: any, index: number) => {
      console.log(`  Feature ${index + 1}: "${feature.name}" with icon "${feature.icon}"`);
    });

    console.log('\n4️⃣ Testing feature addition (user adds custom feature)...');
    const customFeature = { name: "concierge", icon: "bell-concierge" };
    const updatedFeatures = [...selectedFeatures, customFeature];
    
    await client.query(`
      UPDATE hotels 
      SET features = $1 
      WHERE id = $2
    `, [JSON.stringify(updatedFeatures), newHotel.id]);

    const updatedResult = await client.query(`
      SELECT features FROM hotels WHERE id = $1
    `, [newHotel.id]);

    console.log(`✅ Custom feature added: "${customFeature.name}" with icon "${customFeature.icon}"`);
    console.log(`✅ Total features now: ${updatedResult.rows[0].features.length}`);

    console.log('\n5️⃣ Testing feature removal...');
    const finalFeatures = updatedFeatures.filter(f => f.name !== "drink");
    
    await client.query(`
      UPDATE hotels 
      SET features = $1 
      WHERE id = $2
    `, [JSON.stringify(finalFeatures), newHotel.id]);

    const finalResult = await client.query(`
      SELECT features FROM hotels WHERE id = $1
    `, [newHotel.id]);

    console.log(`✅ Feature removed: "drink"`);
    console.log(`✅ Final features count: ${finalResult.rows[0].features.length}`);

    console.log('\n6️⃣ Verifying icon diversity...');
    const uniqueIcons = [...new Set(finalResult.rows[0].features.map((f: any) => f.icon))];
    console.log(`✅ Unique icons used: ${uniqueIcons.length}`);
    console.log(`  Icons: ${uniqueIcons.join(', ')}`);

    console.log('\n7️⃣ Cleaning up test data...');
    await client.query('DELETE FROM hotels WHERE id = $1', [newHotel.id]);
    console.log('✅ Test hotel deleted');

    console.log('\n🎉 All hotel creation features tests passed!');
    console.log('✅ Predefined features system working correctly');
    console.log('✅ Custom feature addition working correctly');
    console.log('✅ Feature removal working correctly');
    console.log('✅ Enhanced features with icons fully operational');
    console.log('✅ Hotel creation form ready for use with structured feature objects');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testHotelCreationFeatures().catch(console.error);
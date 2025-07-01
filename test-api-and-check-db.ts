import { pool } from "./server/db";

/**
 * Test API call and immediately check database to see what was actually saved
 */

async function testAPIAndCheckDB() {
  console.log('🔧 Testing API + DB Check for Features');
  console.log('====================================');

  const hotelData = {
    name: "Schema Validation Test",
    description: "Testing exact schema match", 
    address: "Validation Test Address",
    stars: 4,
    status: "active",
    features: [
      { "name": "wifi", "icon": "Wifi" },
      { "name": "pool", "icon": "Waves" }
    ],
    languages: ["en"],
    parkingAvailable: true,
    wifiAvailable: true,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    imageUrl: "",
    galleryUrls: []
  };

  console.log('📤 Features being sent:', JSON.stringify(hotelData.features, null, 2));

  try {
    const response = await fetch('http://localhost:8080/api/admin/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData)
    });

    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      const hotelId = result.id;
      console.log('🆔 Created hotel ID:', hotelId);
      console.log('📊 API Response features:', result.features);
      
      // Now check database directly
      const client = await pool.connect();
      try {
        const dbResult = await client.query('SELECT id, name, features FROM hotels WHERE id = $1', [hotelId]);
        
        if (dbResult.rows.length > 0) {
          const dbHotel = dbResult.rows[0];
          console.log('\n🗄️ DATABASE CHECK:');
          console.log('  Hotel ID:', dbHotel.id);
          console.log('  Hotel Name:', dbHotel.name);
          console.log('  DB Features:', JSON.stringify(dbHotel.features, null, 2));
          console.log('  DB Features type:', typeof dbHotel.features);
          console.log('  DB Features is array:', Array.isArray(dbHotel.features));
          console.log('  DB Features length:', dbHotel.features?.length);
          
          if (dbHotel.features && dbHotel.features.length > 0) {
            console.log('✅ SUCCESS: Features found in database');
            dbHotel.features.forEach((feature, index) => {
              console.log(`    Feature ${index + 1}:`, JSON.stringify(feature));
            });
          } else {
            console.log('❌ ISSUE: Features empty in database');
          }
          
          // Compare API response vs DB
          console.log('\n🔄 COMPARISON:');
          console.log('  API returned features length:', result.features?.length || 0);
          console.log('  DB contains features length:', dbHotel.features?.length || 0);
          
          if ((result.features?.length || 0) === (dbHotel.features?.length || 0)) {
            console.log('  ✅ API and DB match');
          } else {
            console.log('  ❌ API and DB mismatch');
          }
        }
      } finally {
        client.release();
      }
    } else {
      const error = await response.text();
      console.log('❌ API Error:', error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error);
  }
}

testAPIAndCheckDB().catch(console.error);
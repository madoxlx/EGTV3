import { pool } from "./server/db";

/**
 * Test hotel creation via API to verify features are saved correctly
 */

async function testCreateHotelViaAPI() {
  console.log('🏨 Testing Hotel Creation via API');
  console.log('=================================');

  try {
    const testHotelData = {
      name: "API Test Hotel Features Direct",
      description: "Testing hotel creation via API with detailed logging",
      address: "API Test Address 789",
      stars: 4,
      status: "active",
      features: [
        { name: "coffee", icon: "Coffee" },
        { name: "swimming", icon: "Waves" },
        { name: "test_feature", icon: "Star" }
      ],
      parkingAvailable: true,
      wifiAvailable: true,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      imageUrl: "",
      galleryUrls: []
    };

    console.log('🔍 Sending hotel data with features:');
    console.log(JSON.stringify(testHotelData.features, null, 2));

    // Direct database insertion test
    console.log('\n🧪 Testing direct database insertion...');
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO hotels (
          name, description, address, stars, status, features, 
          parking_available, wifi_available, check_in_time, check_out_time
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id, name, features
      `, [
        testHotelData.name,
        testHotelData.description,
        testHotelData.address,
        testHotelData.stars,
        testHotelData.status,
        JSON.stringify(testHotelData.features), // Convert to JSON string
        testHotelData.parkingAvailable,
        testHotelData.wifiAvailable,
        testHotelData.checkInTime,
        testHotelData.checkOutTime
      ]);

      if (result.rows.length > 0) {
        const insertedHotel = result.rows[0];
        console.log('✅ Direct database insertion successful!');
        console.log('Hotel ID:', insertedHotel.id);
        console.log('Hotel Name:', insertedHotel.name);
        console.log('Features saved:', JSON.stringify(insertedHotel.features, null, 2));
        
        if (insertedHotel.features && Array.isArray(insertedHotel.features) && insertedHotel.features.length > 0) {
          console.log('\n🎉 SUCCESS: Features properly saved to database via direct query!');
          
          // Test via API next
          console.log('\n🔧 Now testing via API...');
          
          const response = await fetch('http://localhost:8080/api/admin/hotels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...testHotelData,
              name: "API Test Hotel Features Via API",
              address: "API Test Address 999"
            })
          });

          const responseText = await response.text();
          console.log('API Response status:', response.status);
          console.log('API Response data:', responseText);
          
          if (response.ok) {
            try {
              const apiResult = JSON.parse(responseText);
              console.log('API Hotel created with features:', JSON.stringify(apiResult.features, null, 2));
              
              if (apiResult.features && Array.isArray(apiResult.features) && apiResult.features.length > 0) {
                console.log('\n🎉 SUCCESS: API also works correctly!');
              } else {
                console.log('\n❌ ISSUE: API created hotel but features are empty');
              }
            } catch (parseError) {
              console.log('API response is not valid JSON');
            }
          } else {
            console.log('❌ API failed to create hotel');
          }
        } else {
          console.log('\n❌ ISSUE: Even direct database insertion failed to save features');
        }
      }
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCreateHotelViaAPI().catch(console.error);
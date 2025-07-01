/**
 * Minimal API test to capture detailed logging for features debug
 */

async function testMinimalAPICall() {
  console.log('🌐 Testing Minimal API Call');
  console.log('===========================');

  const hotelData = {
    name: "Minimal API Test",
    description: "Testing API call", 
    address: "API Test Address",
    stars: 4,
    status: "active",
    features: [
      { name: "wifi", icon: "Wifi" },
      { name: "pool", icon: "Waves" }
    ],
    languages: ["en"],
    parkingAvailable: true,
    wifiAvailable: true,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    imageUrl: "",
    galleryUrls: []
  };

  console.log('📤 Request features:', JSON.stringify(hotelData.features, null, 2));

  try {
    console.log('🔗 Making API call to http://localhost:8080/api/admin/hotels');
    
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
      console.log('📥 Response features:', JSON.stringify(result.features, null, 2));
      console.log('📥 Response features length:', result.features?.length || 0);
      
      if (result.features && result.features.length > 0) {
        console.log('✅ SUCCESS: API preserved features');
      } else {
        console.log('❌ ISSUE: API lost features');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, errorText);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error);
  }
}

testMinimalAPICall().catch(console.error);
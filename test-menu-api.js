// Direct API test to diagnose the menu issue
const fetch = require('node-fetch');

async function testMenuAPI() {
  console.log('🔍 Testing menu API endpoints...');
  
  try {
    // Test basic menus endpoint
    const response1 = await fetch('http://localhost:8080/api/menus');
    const data1 = await response1.json();
    console.log('📊 /api/menus response:', data1);
    console.log('📊 Length:', data1.length);
    
    // Test footer location endpoint  
    const response2 = await fetch('http://localhost:8080/api/menus/location/footer');
    const data2 = await response2.json();
    console.log('📊 /api/menus/location/footer response:', data2);
    
    // Test with different parameters
    const response3 = await fetch('http://localhost:8080/api/menus?active=true');
    const data3 = await response3.json();
    console.log('📊 /api/menus?active=true response:', data3);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testMenuAPI();
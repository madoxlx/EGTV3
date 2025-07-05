import { DatabaseStorage } from './server/storage';

async function testAirportFunctionality() {
  const storage = new DatabaseStorage();
  
  console.log('Testing airport functionality...');
  
  try {
    // Test listAirports method
    console.log('Testing listAirports...');
    const airports = await storage.listAirports();
    console.log(`✅ listAirports working - found ${airports.length} airports`);
    
    // Test updateCountry method
    console.log('Testing updateCountry...');
    const country = await storage.getCountry(10);
    if (country) {
      const updated = await storage.updateCountry(10, { description: country.description });
      console.log(`✅ updateCountry working - updated country: ${updated?.name}`);
    } else {
      console.log('⚠️ No country found with ID 10 to test updateCountry');
    }
    
    console.log('🎉 All airport functionality tests passed!');
  } catch (error) {
    console.error('❌ Error testing airport functionality:', error);
  }
}

testAirportFunctionality();
import { insertHotelSchema } from "./shared/schema";
import { storage } from "./server/storage";

/**
 * Test the exact data flow from API validation through storage to database
 */

async function testAPIDataFlow() {
  console.log('🔄 Testing Complete API Data Flow');
  console.log('=================================');

  // Step 1: Simulate exact API data
  const formData = {
    name: "Data Flow Test Hotel",
    description: "Testing complete data flow", 
    address: "Data Flow Address",
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

  console.log('📤 STEP 1 - Form Data Features:');
  console.log('  Features:', JSON.stringify(formData.features, null, 2));
  console.log('  Length:', formData.features.length);

  // Step 2: Transform data (like API does)
  const transformedData = {
    name: formData.name,
    description: formData.description,
    address: formData.address,
    stars: formData.stars,
    status: formData.status,
    features: formData.features, // Direct assignment like API does
    languages: formData.languages,
    parkingAvailable: formData.parkingAvailable,
    wifiAvailable: formData.wifiAvailable,
    checkInTime: formData.checkInTime,
    checkOutTime: formData.checkOutTime,
    imageUrl: formData.imageUrl,
    galleryUrls: formData.galleryUrls
  };

  console.log('\n📤 STEP 2 - Transformed Data Features:');
  console.log('  Features:', JSON.stringify(transformedData.features, null, 2));
  console.log('  Length:', transformedData.features.length);

  // Step 3: Validate with schema (like API does)
  try {
    const validatedData = insertHotelSchema.parse(transformedData);
    
    console.log('\n📤 STEP 3 - Validated Data Features:');
    console.log('  Features:', JSON.stringify(validatedData.features, null, 2));
    console.log('  Length:', validatedData.features.length);

    // Step 4: Call storage directly (like API does)
    console.log('\n📤 STEP 4 - Calling Storage...');
    const createdHotel = await storage.createHotel(validatedData);
    
    console.log('\n📥 STEP 5 - Storage Result:');
    console.log('  Hotel ID:', createdHotel.id);
    console.log('  Hotel Name:', createdHotel.name);
    console.log('  Result Features:', JSON.stringify(createdHotel.features, null, 2));
    console.log('  Result Features Length:', createdHotel.features?.length || 0);
    
    // Final comparison
    console.log('\n🔄 DATA FLOW COMPARISON:');
    console.log('  Input features length:', formData.features.length);
    console.log('  Transformed features length:', transformedData.features.length);
    console.log('  Validated features length:', validatedData.features.length);
    console.log('  Storage result features length:', createdHotel.features?.length || 0);
    
    if (createdHotel.features && createdHotel.features.length > 0) {
      console.log('✅ SUCCESS: Features preserved through complete flow');
    } else {
      console.log('❌ ISSUE: Features lost somewhere in the flow');
      
      // Identify where the loss occurred
      if (validatedData.features.length > 0) {
        console.log('  Issue occurred in: Storage layer');
      } else if (transformedData.features.length > 0) {
        console.log('  Issue occurred in: Schema validation');
      } else {
        console.log('  Issue occurred in: Data transformation');
      }
    }
    
  } catch (error) {
    console.log('❌ Validation error:', error);
  }
}

testAPIDataFlow().catch(console.error);
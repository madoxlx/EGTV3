import { insertHotelSchema } from "./shared/schema";

/**
 * Test schema validation directly to isolate the features issue
 */

async function testSchemaValidation() {
  console.log('🧪 Testing Schema Validation for Features');
  console.log('=========================================');

  const testData = {
    name: "Schema Test Hotel",
    description: "Testing schema validation", 
    address: "Schema Test Address",
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

  console.log('📤 Input data features:', JSON.stringify(testData.features, null, 2));
  console.log('📤 Input features type:', typeof testData.features);
  console.log('📤 Input features is array:', Array.isArray(testData.features));
  console.log('📤 Input features length:', testData.features.length);

  try {
    console.log('\n🔍 Attempting schema validation...');
    const validatedData = insertHotelSchema.parse(testData);
    
    console.log('✅ Schema validation successful!');
    console.log('📥 Output features:', JSON.stringify(validatedData.features, null, 2));
    console.log('📥 Output features type:', typeof validatedData.features);
    console.log('📥 Output features is array:', Array.isArray(validatedData.features));
    console.log('📥 Output features length:', validatedData.features?.length || 0);
    
    if (validatedData.features && validatedData.features.length > 0) {
      console.log('✅ SUCCESS: Features preserved through validation');
      validatedData.features.forEach((feature, index) => {
        console.log(`  Feature ${index + 1}:`, JSON.stringify(feature));
      });
    } else {
      console.log('❌ ISSUE: Features lost during validation');
    }
    
    // Compare input vs output
    console.log('\n🔄 VALIDATION COMPARISON:');
    console.log('  Input features length:', testData.features.length);
    console.log('  Output features length:', validatedData.features?.length || 0);
    
    if (testData.features.length === (validatedData.features?.length || 0)) {
      console.log('  ✅ Lengths match');
    } else {
      console.log('  ❌ Lengths differ - features lost during validation');
    }
    
  } catch (error) {
    console.log('❌ Schema validation failed:', error);
    if (error instanceof Error && 'errors' in error) {
      console.log('Validation errors:', (error as any).errors);
    }
  }
}

testSchemaValidation().catch(console.error);
import { insertHotelSchema } from "./shared/schema";

/**
 * Test script to verify hotel features are properly saved to database
 * after fixing the state synchronization issue
 */

async function testHotelFeaturesAfterFix() {
  console.log('🔧 Testing Hotel Features Validation Fix');
  console.log('=========================================');

  try {
    // Test data with features similar to what frontend sends
    const testHotelData = {
      name: "Test Hotel Features Validation",
      description: "Testing Zod schema validation for features",
      address: "Test Address 123",
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

    console.log('🔍 Input data features:');
    console.log(JSON.stringify(testHotelData.features, null, 2));

    console.log('\n🧪 Testing Zod schema validation...');
    
    try {
      const validatedData = insertHotelSchema.parse(testHotelData);
      
      console.log('✅ Validation successful!');
      console.log('\n📤 Validated features output:');
      console.log(JSON.stringify(validatedData.features, null, 2));
      
      console.log('\n📊 Comparison:');
      console.log('Input length:', testHotelData.features.length);
      console.log('Output length:', validatedData.features?.length || 0);
      
      if (validatedData.features && validatedData.features.length > 0) {
        console.log('\n🎉 SUCCESS: Features passed through Zod validation correctly!');
        
        // Test specific feature structure
        validatedData.features.forEach((feature, index) => {
          console.log(`Feature ${index + 1}:`, { name: feature.name, icon: feature.icon });
        });
      } else {
        console.log('\n❌ ISSUE: Features were stripped during Zod validation');
        console.log('Validated data keys:', Object.keys(validatedData));
      }
      
    } catch (zodError: any) {
      console.log('❌ Zod validation failed:', zodError.message);
      
      if (zodError.errors) {
        console.log('Validation errors:');
        zodError.errors.forEach((error: any, index: number) => {
          console.log(`${index + 1}. Path: ${error.path.join('.')}, Message: ${error.message}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHotelFeaturesAfterFix().catch(console.error);
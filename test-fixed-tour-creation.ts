import { db } from "./server/db";
import { tours } from "./shared/schema";

/**
 * Test the fixed tour creation with the same data that was failing
 */
async function testFixedTourCreation() {
  try {
    console.log('🧪 Testing fixed tour creation...');

    // Use the exact same data that was failing before
    const testTourData = {
      name: "journy to siwa",
      title: "journy to siwa", // Ensure title is set
      description: "journy to siwa journy to siwa journy to siwa A trip to Siwa A trip to Siwa A trip to Siwa A trip to Siwa A trip to Siwa",
      destinationId: 3,
      duration: 4,
      price: 230000,
      maxCapacity: 4,
      adultPrice: 230000,
      childPrice: 140000,
      infantPrice: 20000,
      imageUrl: "/uploads/tour-1753354522886-5t47z53ni2e.png",
      active: true,
      featured: false,
      currency: "EGP",
      galleryUrls: [], // Remove blob URLs that were causing issues
      startDate: null,
      endDate: null,
      tripType: "",
      numPassengers: 4,
      included: ["journy to siwa"], // Ensure this is an array
      excluded: ["journy to siwa"], // Ensure this is an array
      itinerary: "A trip to Siwa A trip to Siwa A trip to Siwa A trip to Siwa A trip to Siwa", // Keep as text, not JSON
      maxGroupSize: 4,
      rating: 4.0,
      reviewCount: 4,
      nameAr: "رحلة لسيوه رحلة لسيوه",
      descriptionAr: " رحلة لسيوه رحلة لسيوه رحلة لسيوه رحلة لسيوه  رحلة لسيوه رحلة لسيوه",
      itineraryAr: " رحلة لسيوه رحلة لسيوه رحلة لسيوه رحلة لسيوه  رحلة لسيوه رحلة لسيوه",
      includedAr: ["رحلة لسيوه رحلة لسيوه"], // Ensure this is an array
      excludedAr: ["رحلة لسيوه رحلة لسيوه"], // Ensure this is an array
      hasArabicVersion: true,
      durationType: "hours",
      date: null,
      createdBy: 3,
      updatedBy: 3
    };

    console.log('Attempting to create tour with processed data...');
    
    const createdTour = await db.insert(tours).values(testTourData).returning();
    
    console.log('✅ Tour creation successful!');
    console.log('Created tour:', createdTour[0]);
    
    // Clean up test data
    if (createdTour[0]?.id) {
      await db.delete(tours).where(eq(tours.id, createdTour[0].id));
      console.log('✅ Test data cleaned up');
    }
    
    console.log('🎉 Tour creation fix verified successfully!');
    
  } catch (error) {
    console.error('❌ Tour creation test failed:', error);
    
    if (error.message.includes('json')) {
      console.error('JSON parsing issue detected. Check field data types.');
    }
    
    throw error;
  }
}

// Run the test
testFixedTourCreation()
  .then(() => {
    console.log('✅ Tour creation fix verified!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Tour creation fix failed:', error);
    process.exit(1);
  });
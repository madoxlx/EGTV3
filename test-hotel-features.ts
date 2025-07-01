/**
 * Test script to verify hotel feature association functionality
 */

import { storage } from "./server/storage";

async function testHotelFeatureAssociations() {
  try {
    console.log("=== TESTING HOTEL FEATURE ASSOCIATIONS ===");
    
    // Test hotel ID (should use an existing hotel)
    const testHotelId = 55; // From the provided data
    
    // Test feature arrays
    const facilityIds = [1, 2, 3]; // Assuming some facilities exist
    const highlightIds = [1, 2]; // Assuming some highlights exist
    const cleanlinessFeatureIds = [1]; // Assuming some cleanliness features exist
    
    console.log("Testing with hotel ID:", testHotelId);
    console.log("Facility IDs:", facilityIds);
    console.log("Highlight IDs:", highlightIds);
    console.log("Cleanliness Feature IDs:", cleanlinessFeatureIds);
    
    // Test saving facility associations
    console.log("\n--- Testing Facility Associations ---");
    await storage.updateHotelFeatureAssociations(testHotelId, 'facilities', facilityIds);
    const savedFacilities = await storage.getHotelFeatureAssociations(testHotelId, 'facilities');
    console.log("Saved facilities:", savedFacilities);
    
    // Test saving highlight associations
    console.log("\n--- Testing Highlight Associations ---");
    await storage.updateHotelFeatureAssociations(testHotelId, 'highlights', highlightIds);
    const savedHighlights = await storage.getHotelFeatureAssociations(testHotelId, 'highlights');
    console.log("Saved highlights:", savedHighlights);
    
    // Test saving cleanliness feature associations
    console.log("\n--- Testing Cleanliness Feature Associations ---");
    await storage.updateHotelFeatureAssociations(testHotelId, 'cleanlinessFeatures', cleanlinessFeatureIds);
    const savedCleanlinessFeatures = await storage.getHotelFeatureAssociations(testHotelId, 'cleanlinessFeatures');
    console.log("Saved cleanliness features:", savedCleanlinessFeatures);
    
    // Test updating associations (should replace previous ones)
    console.log("\n--- Testing Association Updates ---");
    const newFacilityIds = [2, 4, 5];
    await storage.updateHotelFeatureAssociations(testHotelId, 'facilities', newFacilityIds);
    const updatedFacilities = await storage.getHotelFeatureAssociations(testHotelId, 'facilities');
    console.log("Updated facilities:", updatedFacilities);
    
    // Test clearing associations (empty array)
    console.log("\n--- Testing Association Clearing ---");
    await storage.updateHotelFeatureAssociations(testHotelId, 'highlights', []);
    const clearedHighlights = await storage.getHotelFeatureAssociations(testHotelId, 'highlights');
    console.log("Cleared highlights:", clearedHighlights);
    
    console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
    
  } catch (error) {
    console.error("Test failed with error:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the test
testHotelFeatureAssociations();
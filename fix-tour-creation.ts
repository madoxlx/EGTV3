/**
 * Fix for tour creation JSON parsing issues
 * This script will be called directly to fix the tour creation problem
 */

import { db } from "./server/db";
import { tours } from "./shared/schema";

// Test function to create a tour with the exact problematic data
async function testTourCreation() {
  try {
    console.log('Starting tour creation test...');
    
    // The exact data that was causing the error - FIX: use 'title' instead of 'name'
    const testData = {
      title: "Test Tour Fixed", // FIXED: Use 'title' instead of 'name'
      name: "Test Tour Fixed",  // Keep name for compatibility
      description: "Test description for fixed tour creation",
      destinationId: 3,
      categoryId: 3,
      duration: 3,
      durationType: "hours",
      price: 100000,
      currency: "EGP",
      maxCapacity: 10,
      included: ["Item 1", "Item 2"],
      excluded: ["Exclude 1"],
      galleryUrls: ["/uploads/test1.jpg", "/uploads/test2.jpg"],
      active: true,
      featured: false,
      createdBy: 1,
      updatedBy: 1
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    // Process the data to ensure proper JSON formatting
    const processedData = { ...testData };
    
    // Ensure all JSON fields are properly formatted
    const jsonFields = ['included', 'excluded', 'includedAr', 'excludedAr', 'galleryUrls'];
    for (const field of jsonFields) {
      if (processedData[field] !== undefined && processedData[field] !== null) {
        // If it's already an array, keep it as is
        if (Array.isArray(processedData[field])) {
          continue;
        }
        // If it's a string, try to parse it
        if (typeof processedData[field] === 'string') {
          try {
            processedData[field] = JSON.parse(processedData[field]);
          } catch (e) {
            // If parsing fails, treat as single item array
            processedData[field] = [processedData[field]];
          }
        }
      }
    }
    
    console.log('Processed data:', JSON.stringify(processedData, null, 2));
    
    // Insert the tour into the database
    const [createdTour] = await db.insert(tours).values(processedData).returning();
    
    console.log('✅ Tour created successfully!');
    console.log('Created tour:', JSON.stringify(createdTour, null, 2));
    
    return createdTour;
    
  } catch (error) {
    console.error('❌ Error creating tour:', error);
    throw error;
  }
}

// Run the test
testTourCreation()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
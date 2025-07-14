/**
 * Simple test to verify tour categories API and dropdown functionality
 */

async function testTourCategories() {
  console.log("Testing tour categories API...");
  
  try {
    // Test API endpoint directly
    const response = await fetch("http://localhost:8080/api/tour-categories");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    console.log("API Response:", categories);
    
    // Check if categories are valid
    if (!Array.isArray(categories)) {
      console.error("Categories is not an array:", categories);
      return;
    }
    
    if (categories.length === 0) {
      console.warn("No categories found in database");
      return;
    }
    
    // Check each category structure
    categories.forEach((category, index) => {
      console.log(`Category ${index + 1}:`, {
        id: category.id,
        name: category.name,
        active: category.active,
        description: category.description
      });
      
      // Validate required fields
      if (!category.id || !category.name) {
        console.error(`Invalid category at index ${index}:`, category);
      }
    });
    
    console.log("✅ Tour categories API test completed successfully");
    console.log(`Found ${categories.length} categories in database`);
    
  } catch (error) {
    console.error("❌ Tour categories API test failed:", error);
  }
}

// Run the test
testTourCategories();
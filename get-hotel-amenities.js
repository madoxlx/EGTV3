
const fetch = require('node-fetch');

/**
 * Get hotel amenities by hotel ID
 * @param {number} hotelId - The ID of the hotel
 * @param {string} baseUrl - The base URL of your API (optional, defaults to localhost)
 * @returns {Promise<Object>} Hotel data with amenities
 */
async function getHotelAmenitiesById(hotelId, baseUrl = 'http://localhost:5000') {
  try {
    if (!hotelId || typeof hotelId !== 'number') {
      throw new Error('Hotel ID is required and must be a number');
    }

    // Fetch hotel data from the API
    const response = await fetch(`${baseUrl}/api/hotels/${hotelId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Hotel with ID ${hotelId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const hotelData = await response.json();
    
    // Extract amenities from the hotel data
    const amenities = {
      hotelId: hotelData.id,
      hotelName: hotelData.name,
      amenities: hotelData.amenities || [],
      facilities: hotelData.facilities || [],
      highlights: hotelData.highlights || [],
      cleanlinessFeatures: hotelData.cleanlinessFeatures || [],
      // Basic amenity flags
      basicAmenities: {
        wifi: hotelData.wifiAvailable || false,
        parking: hotelData.parkingAvailable || false,
        airportTransfer: hotelData.airportTransferAvailable || false,
        carRental: hotelData.carRentalAvailable || false,
        shuttle: hotelData.shuttleAvailable || false,
        petFriendly: hotelData.petFriendly || false,
        accessibleFacilities: hotelData.accessibleFacilities || false
      }
    };

    return amenities;

  } catch (error) {
    console.error('Error fetching hotel amenities:', error.message);
    throw error;
  }
}

/**
 * Get hotel amenities by hotel ID (admin route with more details)
 * @param {number} hotelId - The ID of the hotel
 * @param {string} baseUrl - The base URL of your API (optional, defaults to localhost)
 * @param {string} authToken - Authentication token for admin access (optional)
 * @returns {Promise<Object>} Detailed hotel data with all amenities
 */
async function getHotelAmenitiesByIdAdmin(hotelId, baseUrl = 'http://localhost:5000', authToken = null) {
  try {
    if (!hotelId || typeof hotelId !== 'number') {
      throw new Error('Hotel ID is required and must be a number');
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    // Add authorization header if token is provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Fetch detailed hotel data from the admin API
    const response = await fetch(`${baseUrl}/api/admin/hotels/${hotelId}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required for admin access');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions for admin access');
      }
      if (response.status === 404) {
        throw new Error(`Hotel with ID ${hotelId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const hotelData = await response.json();
    
    // Return comprehensive amenities data
    return {
      hotelId: hotelData.id,
      hotelName: hotelData.name,
      description: hotelData.description,
      // Legacy amenities (JSON field)
      legacyAmenities: hotelData.amenities || [],
      // New structured amenities
      facilities: hotelData.facilities || [],
      highlights: hotelData.highlights || [],
      cleanlinessFeatures: hotelData.cleanlinessFeatures || [],
      // Basic service flags
      services: {
        wifi: hotelData.wifiAvailable || false,
        parking: hotelData.parkingAvailable || false,
        airportTransfer: hotelData.airportTransferAvailable || false,
        carRental: hotelData.carRentalAvailable || false,
        shuttle: hotelData.shuttleAvailable || false,
        petFriendly: hotelData.petFriendly || false,
        accessibleFacilities: hotelData.accessibleFacilities || false
      },
      // Additional hotel info
      stars: hotelData.stars,
      checkInTime: hotelData.checkInTime,
      checkOutTime: hotelData.checkOutTime,
      status: hotelData.status
    };

  } catch (error) {
    console.error('Error fetching hotel amenities (admin):', error.message);
    throw error;
  }
}

/**
 * Example usage function
 */
async function example() {
  try {
    console.log('=== Getting Hotel Amenities ===');
    
    // Example 1: Get basic amenities for hotel ID 1
    const basicAmenities = await getHotelAmenitiesById(1);
    console.log('Basic amenities:', JSON.stringify(basicAmenities, null, 2));
    
    // Example 2: Get detailed amenities using admin route
    // Note: You'll need proper authentication for this to work
    // const detailedAmenities = await getHotelAmenitiesByIdAdmin(1);
    // console.log('Detailed amenities:', JSON.stringify(detailedAmenities, null, 2));
    
  } catch (error) {
    console.error('Example failed:', error.message);
  }
}

// Export functions for use in other modules
module.exports = {
  getHotelAmenitiesById,
  getHotelAmenitiesByIdAdmin,
  example
};

// Run example if this file is executed directly
if (require.main === module) {
  example();
}

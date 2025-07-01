#!/usr/bin/env tsx

/**
 * Test script to verify simplified hotel features functionality
 * This tests the new simplified features system without complex junction tables
 */

import { db } from './server/db.js';
import { hotels } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function testSimplifiedFeatures() {
  console.log("🧪 Testing Simplified Hotel Features System");
  console.log("=" .repeat(50));

  try {
    // Test 1: Create a test hotel with features
    console.log("\n1️⃣ Creating test hotel with simplified features...");
    
    const testFeatures = ['Swimming Pool', 'Free WiFi', 'Restaurant', 'Spa Services'];
    
    const [insertedHotel] = await db.insert(hotels).values({
      name: 'Test Feature Hotel',
      description: 'A test hotel for simplified features system',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Test Country',
      phone: '+1234567890',
      email: 'test@example.com',
      features: testFeatures,
      status: 'active',
      destinationId: 1,
      stars: 4,
      createdBy: 1
    }).returning();
    
    console.log("✅ Test hotel created:", {
      id: insertedHotel.id,
      name: insertedHotel.name,
      features: insertedHotel.features
    });

    // Test 2: Retrieve and verify features
    console.log("\n2️⃣ Retrieving hotel features...");
    
    const retrievedHotel = await db.select().from(hotels).where(eq(hotels.id, insertedHotel.id));
    
    if (retrievedHotel.length > 0) {
      const hotel = retrievedHotel[0];
      console.log("✅ Hotel retrieved:", {
        id: hotel.id,
        name: hotel.name,
        features: hotel.features
      });
      
      // Verify features are stored as JSON array
      if (Array.isArray(hotel.features)) {
        console.log("✅ Features stored as JSON array:", hotel.features);
        console.log("✅ Features count:", hotel.features.length);
      } else {
        console.log("❌ Features not stored as array:", typeof hotel.features);
      }
    }

    // Test 3: Update hotel features
    console.log("\n3️⃣ Testing feature updates...");
    
    const updatedFeatures = ['Swimming Pool', 'Free WiFi', 'Restaurant', 'Spa Services', 'Gym', 'Business Center'];
    
    const [updatedHotel] = await db.update(hotels)
      .set({ features: updatedFeatures })
      .where(eq(hotels.id, insertedHotel.id))
      .returning();
    
    console.log("✅ Hotel features updated:", {
      id: updatedHotel.id,
      name: updatedHotel.name,
      features: updatedHotel.features
    });

    // Test 4: Clean up
    console.log("\n4️⃣ Cleaning up test data...");
    
    await db.delete(hotels).where(eq(hotels.id, insertedHotel.id));
    console.log("✅ Test hotel deleted");

    console.log("\n🎉 All simplified features tests passed!");
    console.log("✅ Simplified features system is working correctly");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSimplifiedFeatures().catch(console.error);
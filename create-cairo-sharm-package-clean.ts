import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { countries, cities, hotels, rooms, packages } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the external database URL directly
const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("Database URL: ebn elwes5a", databaseUrl.replace(/:[^:@]*@/, ':****@'));

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false
});

const db = drizzle(pool);

async function createCairoSharmPackage() {
  try {
    console.log("Attempting to connect to external PostgreSQL database...");
    console.log("Database URL:", databaseUrl.replace(/:[^:@]*@/, ':****@'));
    console.log("Creating 7-day Cairo & Sharm El Sheikh package with hotels and rooms...");

    // Test database connection
    const client = await pool.connect();
    console.log("✅ Database connection established successfully");
    console.log("Connected to database:", client.database);
    client.release();

    // Get Egypt country
    const egyptQuery = await db.select().from(countries).where(eq(countries.name, 'Egypt')).limit(1);
    if (egyptQuery.length === 0) {
      throw new Error("Egypt country not found in database");
    }
    const egyptCountry = egyptQuery[0];
    console.log("Found Egypt country:", egyptCountry.name);

    // Get Cairo city
    const cairoQuery = await db.select().from(cities).where(eq(cities.name, 'Cairo')).limit(1);
    if (cairoQuery.length === 0) {
      throw new Error("Cairo city not found in database");
    }
    const cairoCity = cairoQuery[0];
    console.log("Found Cairo city:", cairoCity.name);

    // Get Sharm El Sheikh city
    const sharmQuery = await db.select().from(cities).where(eq(cities.name, 'Sharm El Sheikh')).limit(1);
    if (sharmQuery.length === 0) {
      throw new Error("Sharm El Sheikh city not found in database");
    }
    const sharmCity = sharmQuery[0];
    console.log("Found Sharm El Sheikh city:", sharmCity.name);

    // Define hotel data with only essential fields that exist in database
    const hotelsData = [
      {
        name: "Steigenberger Hotel El Tahrir Cairo",
        description: "Luxury 5-star hotel in downtown Cairo, near Tahrir Square and Egyptian Museum. Features elegant rooms, multiple restaurants, spa facilities, and panoramic city views.",
        shortDescription: "Luxury 5-star hotel in downtown Cairo near Egyptian Museum",
        address: "Tahrir Square, Downtown Cairo, Egypt",
        city: "Cairo",
        country: "Egypt",
        cityId: cairoCity.id,
        countryId: egyptCountry.id,
        starRating: 5,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
        amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Concierge", "Business Center"],
        basePrice: 3500,
        currency: "EGP",
        guestRating: 4.5,
        featured: true
      },
      {
        name: "Four Seasons Hotel Cairo at Nile Plaza",
        description: "Premium 5-star hotel with stunning Nile views, world-class amenities, and exceptional service in the heart of Cairo.",
        shortDescription: "Premium 5-star hotel with stunning Nile views in Cairo center",
        address: "1089 Corniche El Nil, Garden City, Cairo",
        city: "Cairo", 
        country: "Egypt",
        cityId: cairoCity.id,
        countryId: egyptCountry.id,
        starRating: 5,
        imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500",
        amenities: ["WiFi", "Pool", "Spa", "Multiple Restaurants", "Gym", "Business Center", "Nile Views"],
        basePrice: 4200,
        currency: "EGP",
        guestRating: 4.8,
        featured: true
      },
      {
        name: "Parrotel Aquapark Resort",
        description: "4-star beachfront resort featuring multiple pools, water slides, and direct beach access in Sharm El Sheikh.",
        shortDescription: "4-star beachfront resort with aquapark in Sharm El Sheikh",
        address: "Sharks Bay, Sharm El Sheikh",
        city: "Sharm El Sheikh",
        country: "Egypt",
        cityId: sharmCity.id,
        countryId: egyptCountry.id,
        starRating: 4,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
        amenities: ["All Inclusive", "Beach Access", "Water Park", "Multiple Pools", "Restaurants", "Bars"],
        basePrice: 950,
        currency: "EGP",
        guestRating: 4.3,
        featured: false
      },
      {
        name: "Sheraton Sharm Hotel",
        description: "Luxury 5-star beachfront resort offering premium accommodations, multiple dining venues, and comprehensive recreational facilities.",
        shortDescription: "Luxury 5-star beachfront resort with premium accommodations",
        address: "Peace Road, Sharm El Sheikh",
        city: "Sharm El Sheikh",
        country: "Egypt",
        cityId: sharmCity.id,
        countryId: egyptCountry.id,
        starRating: 5,
        imageUrl: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=500",
        amenities: ["All Inclusive", "Beach Access", "Spa", "Multiple Restaurants", "Pools", "Fitness Center"],
        basePrice: 1400,
        currency: "EGP",
        guestRating: 4.6,
        featured: true
      }
    ];

    // Create hotels and rooms
    const createdHotels = [];
    for (const hotelData of hotelsData) {
      const [hotel] = await db.insert(hotels).values(hotelData).returning();
      createdHotels.push(hotel);
      console.log(`✅ Created hotel: ${hotel.name} (${hotel.starRating}★)`);

      // Create rooms for each hotel
      const roomTypes = [
        {
          name: "Standard Double Room",
          description: "Comfortable double room with modern amenities",
          type: "Standard",
          maxOccupancy: 2,
          maxAdults: 2,
          maxChildren: 0,
          maxInfants: 0,
          price: Math.round(hotelData.basePrice * 1.0),
          bedType: "Double Bed",
          amenities: ["WiFi", "AC", "TV", "Minibar"],
          view: "City View",
          hotelId: hotel.id,
          currency: "EGP"
        },
        {
          name: "Standard Triple Room", 
          description: "Spacious room accommodating up to 3 guests",
          type: "Standard",
          maxOccupancy: 3,
          maxAdults: 3,
          maxChildren: 0,
          maxInfants: 0,
          price: Math.round(hotelData.basePrice * 1.3),
          bedType: "Double + Single Bed",
          amenities: ["WiFi", "AC", "TV", "Minibar"],
          view: "City View",
          hotelId: hotel.id,
          currency: "EGP"
        }
      ];

      for (const roomData of roomTypes) {
        const [room] = await db.insert(rooms).values(roomData).returning();
        console.log(`  ✅ Created room: ${room.name} - ${room.price} EGP`);
      }
    }

    // Create the main package
    const packageData = {
      title: "7 Days 6 Nights Holiday Package to Cairo & Sharm El Sheikh",
      description: "Complete holiday package including 3 nights hotel accommodation in Cairo, 3 nights hotel accommodation in Sharm El Sheikh, full day tour in Cairo with expert guide, all tours with air-conditioned transportation, meet and assist services, camel ride, and entrance fees.",
      overview: "Experience the best of Egypt with this carefully crafted 7-day journey combining the historical wonders of Cairo with the pristine beaches and coral reefs of Sharm El Sheikh. This package includes guided tours, comfortable accommodations, and seamless transfers.",
      price: 26850,
      discountedPrice: 24950,
      currency: "EGP",
      duration: 7,
      durationType: "days",
      countryId: egyptCountry.id,
      category: "Cultural & Beach",
      type: "dynamic",
      featured: true,
      includedFeatures: [
        "3 nights hotel accommodation in Cairo",
        "3 nights hotel accommodation in Sharm El Sheikh",
        "Full day tour in Cairo with expert guide",
        "All tours with air-conditioned transportation",
        "Meet and assist services",
        "Camel ride experience",
        "All entrance fees included",
        "Airport transfers",
        "Breakfast daily"
      ],
      excludedFeatures: [
        "International flights",
        "Travel insurance",
        "Personal expenses",
        "Optional excursions",
        "Drinks during meals",
        "Tips and gratuities"
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrival in Cairo",
          description: "Airport transfer to hotel, welcome briefing, rest day"
        },
        {
          day: 2,
          title: "Cairo City Tour",
          description: "Visit Pyramids of Giza, Sphinx, Egyptian Museum with expert guide"
        },
        {
          day: 3,
          title: "Islamic Cairo & Transfer",
          description: "Explore Islamic Cairo, transfer to Sharm El Sheikh"
        },
        {
          day: 4,
          title: "Beach & Relaxation",
          description: "Free day at Red Sea beaches, snorkeling optional"
        },
        {
          day: 5,
          title: "Desert Safari",
          description: "Camel ride, Bedouin experience, desert adventure"
        },
        {
          day: 6,
          title: "Water Activities",
          description: "Boat trip, diving/snorkeling, coral reef exploration"
        },
        {
          day: 7,
          title: "Departure",
          description: "Check out, airport transfer, departure"
        }
      ],
      bestTimeToVisit: "October to April for ideal weather conditions",
      cancellationPolicy: "Free cancellation up to 7 days before travel. 50% refund for 3-7 days notice. No refund for cancellations within 3 days of travel.",
      childrenPolicy: "Children under 2 years travel free. Ages 2-11 receive 25% discount. Ages 12+ pay adult rates.",
      termsAndConditions: "All rates are per person based on double occupancy. Single supplement applies. Package prices subject to availability and seasonal variations.",
      adultCount: 2,
      childrenCount: 0,
      infantCount: 0,
      selectedHotels: createdHotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        starRating: hotel.starRating,
        city: hotel.city,
        nights: hotel.city === "Cairo" ? 3 : 3
      })),
      transportationDetails: "Private air-conditioned vehicles for all transfers and tours. Domestic flight Cairo to Sharm El Sheikh included."
    };

    const [createdPackage] = await db.insert(packages).values(packageData).returning();
    console.log(`✅ Created package: ${createdPackage.title} (ID: ${createdPackage.id})`);
    console.log(`💰 Price: ${createdPackage.price} ${createdPackage.currency}`);
    console.log(`⭐ Featured: ${createdPackage.featured ? 'Yes' : 'No'}`);
    console.log(`🏨 Hotels: ${createdHotels.length} hotels with rooms created`);

    console.log("\n🎉 Cairo & Sharm El Sheikh package creation completed successfully!");
    console.log(`📋 Package Details:`);
    console.log(`   - ID: ${createdPackage.id}`);
    console.log(`   - Duration: ${createdPackage.duration} ${createdPackage.durationType}`);
    console.log(`   - Price: ${createdPackage.price} EGP (Discounted: ${createdPackage.discountedPrice} EGP)`);
    console.log(`   - Category: ${createdPackage.category}`);
    console.log(`   - Hotels: ${createdHotels.length} created`);
    console.log(`   - Rooms: ${createdHotels.length * 2} created (2 per hotel)`);

  } catch (error) {
    console.error("❌ Error creating package:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the package creation
createCairoSharmPackage()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
import { db } from "./server/db.js";
import { hotels, rooms, packages, countries, cities } from "./shared/schema.js";
import { eq } from "drizzle-orm";

async function createCairoSharmPackage() {
  try {
    console.log("Creating 7-day Cairo & Sharm El Sheikh package with hotels and rooms...");

    // Create Egypt if it doesn't exist
    let egypt = await db.select().from(countries).where(eq(countries.name, "Egypt")).limit(1);
    let egyptId;
    
    if (!egypt.length) {
      const [newEgypt] = await db.insert(countries).values({
        name: "Egypt",
        code: "EG",
        description: "Ancient land of pharaohs and pyramids, offering rich history and stunning Red Sea coast",
        imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        active: true
      }).returning();
      egyptId = newEgypt.id;
      console.log("Created Egypt country:", newEgypt.name);
    } else {
      egyptId = egypt[0].id;
      console.log("Found Egypt country:", egypt[0].name);
    }

    // Create Cairo if it doesn't exist
    let cairo = await db.select().from(cities).where(eq(cities.name, "Cairo")).limit(1);
    let cairoId;
    
    if (!cairo.length) {
      const [newCairo] = await db.insert(cities).values({
        name: "Cairo",
        countryId: egyptId,
        description: "Egypt's sprawling capital, home to the iconic Giza pyramid complex and world-renowned Egyptian Museum",
        imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        active: true
      }).returning();
      cairoId = newCairo.id;
      console.log("Created Cairo city:", newCairo.name);
    } else {
      cairoId = cairo[0].id;
      console.log("Found Cairo city:", cairo[0].name);
    }

    // Check for Sharm El Sheikh
    const sharmElSheikh = await db.select().from(cities).where(eq(cities.name, "Sharm El Sheikh")).limit(1);
    const sharmId = sharmElSheikh.length > 0 ? sharmElSheikh[0].id : null;

    // Create Sharm El Sheikh city if it doesn't exist
    let sharmCityId = sharmId;
    if (!sharmId) {
      const [newSharm] = await db.insert(cities).values({
        name: "Sharm El Sheikh",
        countryId: egyptId,
        description: "Premier Red Sea resort destination in Egypt",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        active: true
      }).returning();
      sharmCityId = newSharm.id;
      console.log("Created Sharm El Sheikh city:", newSharm.name);
    }

    // Create 4-star hotels in Cairo
    const cairo4StarHotels = [
      {
        name: "Grand Pyramids Hotel",
        description: "Elegant 4-star hotel with stunning views of the Giza Pyramids. Features modern amenities, multiple dining options, and easy access to Cairo's historic attractions.",
        cityId: cairoId,
        countryId: egyptId,
        address: "Pyramids Road, Giza, Cairo",
        city: "Cairo",
        country: "Egypt",
        stars: 4,
        imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        ],
        amenities: ["WiFi", "Restaurant", "Pool", "Fitness Center", "Room Service", "Air Conditioning"],
        features: ["Pyramids View", "24/7 Front Desk", "Tour Desk", "Free WiFi", "Restaurant", "Pool"],
        rating: 4.2,
        basePrice: 850
      },
      {
        name: "Regency Pyramids Hotel",
        description: "Modern 4-star accommodation offering comfortable rooms and excellent service near the iconic Pyramids of Giza.",
        cityId: cairoId,
        countryId: egyptId,
        address: "Pyramids Road, Giza, Cairo",
        city: "Cairo",
        country: "Egypt",
        stars: 4,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        ],
        amenities: ["WiFi", "Restaurant", "Bar", "Room Service", "Air Conditioning"],
        features: ["Modern Rooms", "Restaurant", "Bar", "Free WiFi", "Room Service"],
        rating: 4.0,
        basePrice: 800
      }
    ];

    // Create 5-star hotels in Cairo
    const cairo5StarHotels = [
      {
        name: "Ramses Hilton Hotel",
        description: "Luxury 5-star hotel in the heart of Cairo with Nile views, premium amenities, and world-class service.",
        cityId: cairoId,
        countryId: egyptId,
        address: "1115 Corniche El Nil, Downtown Cairo",
        city: "Cairo",
        country: "Egypt",
        stars: 5,
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        ],
        amenities: ["WiFi", "Multiple Restaurants", "Spa", "Fitness Center", "Pool", "Concierge", "Room Service"],
        features: ["Nile View", "Luxury Spa", "Multiple Restaurants", "Fitness Center", "Pool", "Concierge"],
        rating: 4.5,
        basePrice: 1200
      }
    ];

    // Create 4-star hotels in Sharm El Sheikh
    const sharm4StarHotels = [
      {
        name: "Parrotel Aquapark Resort",
        description: "4-star beachfront resort featuring multiple pools, water slides, and direct beach access in Sharm El Sheikh.",
        cityId: sharmCityId,
        countryId: egyptId,
        address: "Sharks Bay, Sharm El Sheikh",
        city: "Sharm El Sheikh",
        country: "Egypt",
        stars: 4,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          "https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        ],
        amenities: ["All Inclusive", "Beach Access", "Water Park", "Multiple Pools", "Restaurants", "Bars"],
        features: ["Beach Access", "Aquapark", "All Inclusive", "Multiple Pools", "Water Slides", "Restaurants"],
        rating: 4.3,
        basePrice: 950
      }
    ];

    // Create 5-star hotels in Sharm El Sheikh
    const sharm5StarHotels = [
      {
        name: "Sheraton Sharm Hotel",
        description: "Luxury 5-star beachfront resort offering premium accommodations, multiple dining venues, and comprehensive recreational facilities.",
        cityId: sharmCityId,
        countryId: egyptId,
        address: "Peace Road, Sharm El Sheikh",
        city: "Sharm El Sheikh",
        country: "Egypt",
        stars: 5,
        imageUrl: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        ],
        amenities: ["All Inclusive", "Beach Access", "Spa", "Multiple Restaurants", "Pools", "Fitness Center"],
        features: ["Luxury Beach Resort", "Spa", "Multiple Restaurants", "Pools", "Fitness Center", "Premium Service"],
        rating: 4.6,
        basePrice: 1400
      }
    ];

    // Create all hotels
    const allHotels = [...cairo4StarHotels, ...cairo5StarHotels, ...sharm4StarHotels, ...sharm5StarHotels];
    const createdHotels = [];

    for (const hotelData of allHotels) {
      // Remove any fields that might not exist in the database schema
      const cleanHotelData = {
        name: hotelData.name,
        description: hotelData.description,
        shortDescription: hotelData.description.substring(0, 100) + "...",
        cityId: hotelData.cityId,
        countryId: hotelData.countryId,
        address: hotelData.address,
        city: hotelData.city,
        country: hotelData.country,
        starRating: hotelData.stars,
        imageUrl: hotelData.imageUrl,
        amenities: hotelData.amenities,
        guestRating: hotelData.rating,
        basePrice: hotelData.basePrice,
        currency: "EGP",
        featured: false
      };
      
      const [hotel] = await db.insert(hotels).values(cleanHotelData).returning();
      createdHotels.push(hotel);
      console.log(`Created hotel: ${hotel.name} (${hotel.stars}★)`);

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
          price: Math.round(hotelData.basePrice * 1.0), // Base price
          bedType: "Double Bed",
          amenities: ["WiFi", "AC", "TV", "Minibar"],
          view: "City View"
        },
        {
          name: "Standard Triple Room",
          description: "Spacious room accommodating up to 3 guests",
          type: "Standard",
          maxOccupancy: 3,
          maxAdults: 3,
          maxChildren: 0,
          maxInfants: 0,
          price: Math.round(hotelData.basePrice * 1.3), // 30% more for triple
          bedType: "Double + Single Bed",
          amenities: ["WiFi", "AC", "TV", "Minibar"],
          view: "City View"
        }
      ];

      for (const roomData of roomTypes) {
        const [room] = await db.insert(rooms).values({
          ...roomData,
          hotelId: hotel.id,
          currency: "EGP"
        }).returning();
        console.log(`  Created room: ${room.name} - ${room.price} EGP`);
      }
    }

    // Create the main package
    const packageData = {
      title: "7 Days 6 Nights Holiday Package to Cairo & Sharm El Sheikh",
      description: "Complete holiday package including 3 nights hotel accommodation in Cairo, 3 nights hotel accommodation in Sharm El Sheikh, full day tour in Cairo with expert guide, all tours with air-conditioned transportation, meet and assist services, camel ride, and entrance fees.",
      overview: "Experience the best of Egypt with this carefully crafted 7-day journey combining the historical wonders of Cairo with the pristine beaches and coral reefs of Sharm El Sheikh. This package includes guided tours, comfortable accommodations, and seamless transfers.",
      price: 41000, // Average price in EGP (approximately $475 USD * 86 EGP/USD)
      discountedPrice: 37600, // Discounted price for groups
      currency: "EGP",
      duration: 7,
      durationType: "days",
      type: "dynamic",
      category: "holiday",
      featured: true,
      countryId: egyptId,
      cityId: cairoId,
      imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      ],
      rating: 5,
      idealFor: [
        "Couples",
        "Families",
        "Cultural Enthusiasts",
        "Beach Lovers",
        "First-time Egypt Visitors"
      ],
      includedFeatures: [
        "3 nights hotel accommodation in Cairo (bed & breakfast)",
        "3 nights hotel accommodation in Sharm El Sheikh (soft all-inclusive)",
        "Full day Cairo tour (Pyramids, Sphinx, Egyptian Museum, Khan El Khalili)",
        "Expert Egyptology guide",
        "Private air-conditioned transportation",
        "Meet and assist services at all destinations",
        "Camel ride at Pyramids area",
        "All entrance fees included",
        "All taxes and service charges"
      ],
      excludedFeatures: [
        "Entry visa for Egypt",
        "Domestic flight tickets Cairo/Sharm/Cairo",
        "Personal items and shopping",
        "Tipping for guides and drivers",
        "Optional tours and excursions",
        "Travel insurance"
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrival in Cairo",
          description: "Arrival at Cairo airport, meet & assist through customs, transfer to hotel",
          meals: "No meals included",
          activities: ["Airport transfer", "Hotel check-in", "Welcome briefing"]
        },
        {
          day: 2,
          title: "Cairo Full Day Tour",
          description: "Visit Giza Pyramids, Sphinx, Egyptian Museum, and Khan El Khalili Bazaar",
          meals: "Breakfast included",
          activities: ["Giza Pyramids complex", "Sphinx visit", "Egyptian Museum", "Khan El Khalili shopping", "Camel ride"]
        },
        {
          day: 3,
          title: "Transfer to Sharm El Sheikh",
          description: "Transfer to Cairo airport, flight to Sharm El Sheikh, hotel check-in",
          meals: "Breakfast, lunch & dinner",
          activities: ["Airport transfer", "Domestic flight", "Hotel check-in", "Welcome drink"]
        },
        {
          day: 4,
          title: "Free Day in Sharm El Sheikh",
          description: "Leisure day at resort with all-inclusive amenities",
          meals: "Breakfast, lunch & dinner",
          activities: ["Beach relaxation", "Pool activities", "Resort amenities", "Optional excursions available"]
        },
        {
          day: 5,
          title: "Free Day in Sharm El Sheikh",
          description: "Another day to enjoy the Red Sea and resort facilities",
          meals: "Breakfast, lunch & dinner",
          activities: ["Snorkeling", "Water sports", "Spa treatments", "Optional boat trips available"]
        },
        {
          day: 6,
          title: "Return to Cairo",
          description: "Transfer to Sharm airport, flight to Cairo, hotel check-in",
          meals: "Breakfast included",
          activities: ["Airport transfer", "Domestic flight", "Cairo hotel check-in", "Optional evening activities"]
        },
        {
          day: 7,
          title: "Departure",
          description: "Hotel check-out, transfer to Cairo airport for final departure",
          meals: "Breakfast included",
          activities: ["Hotel check-out", "Airport transfer", "Departure assistance"]
        }
      ],
      whatToPack: [
        "Comfortable walking shoes",
        "Light cotton clothing",
        "Sun hat and sunglasses",
        "Sunscreen (high SPF)",
        "Swimwear and beach towel",
        "Camera and extra batteries",
        "Personal medications",
        "Light jacket for evenings"
      ],
      bestTimeToVisit: "October to April for pleasant weather, avoiding extreme summer heat",
      transportationDetails: "Private air-conditioned vehicles for all transfers and tours. Domestic flights between Cairo and Sharm El Sheikh included in package cost.",
      cancellationPolicy: "Free cancellation up to 7 days before travel. 50% refund for cancellations 3-7 days before. No refund for cancellations within 3 days of travel.",
      childrenPolicy: "Children 0-5.99 years free sharing parents room without extra bed. Children 6-11 years pay 50% of adult rate sharing parents room without extra bed.",
      termsAndConditions: "Package rates valid from May 1, 2025 to October 31, 2025. Minimum 2 passengers required. Hotel categories may be substituted with similar properties. Domestic flights subject to availability and schedule changes.",
      adultCount: 2,
      childrenCount: 0,
      infantCount: 0,
      maxGroupSize: 15,
      validUntil: new Date("2025-10-31"),
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-10-31")
    };

    const [createdPackage] = await db.insert(packages).values(packageData).returning();
    
    console.log("\n✅ Package created successfully!");
    console.log(`Package ID: ${createdPackage.id}`);
    console.log(`Package Name: ${createdPackage.title}`);
    console.log(`Price: ${createdPackage.price} ${createdPackage.currency}`);
    console.log(`Discounted Price: ${createdPackage.discountedPrice} ${createdPackage.currency}`);
    console.log(`Duration: ${createdPackage.duration} ${createdPackage.durationType}`);
    console.log(`Hotels Created: ${createdHotels.length}`);
    
    console.log("\nCreated Hotels:");
    createdHotels.forEach(hotel => {
      console.log(`- ${hotel.name} (${hotel.stars}★) in ${hotel.city}`);
    });

    return {
      package: createdPackage,
      hotels: createdHotels
    };

  } catch (error) {
    console.error("Error creating package:", error);
    throw error;
  }
}

// Run the script
createCairoSharmPackage()
  .then(() => {
    console.log("\n🎉 Cairo & Sharm El Sheikh package creation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
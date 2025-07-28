import {
  users,
  User,
  InsertUser,
  countries,
  Country,
  InsertCountry,
  cities,
  City,
  InsertCity,
  airports,
  Airport,
  InsertAirport,
  destinations,
  Destination,
  InsertDestination,
  packages,
  Package,
  InsertPackage,
  tours,
  Tour,
  InsertTour,
  hotels,
  Hotel,
  InsertHotel,
  rooms,
  Room,
  InsertRoom,
  roomCategories,
  RoomCategory,
  InsertRoomCategory,
  heroSlides,
  HeroSlide,
  InsertHeroSlide,
  homepageSections,
  HomepageSection,
  InsertHomepageSection,
  menus,
  Menu,
  InsertMenu,
  translations,
  Translation,
  InsertTranslation,
  hotelFacilities,
  hotelHighlights,
  cleanlinessFeatures,
  hotelCategories,
  hotelToFacilities,
  hotelToHighlights,
  hotelToCleanlinessFeatures,
  transportTypes,
  TransportType,
  whyChooseUsSections,
  WhyChooseUsSection,
  InsertWhyChooseUsSection,
  transportation,
  Transport,
  InsertTransport,
  transportLocations,
  TransportLocation,
  InsertTransportLocation,
  transportDurations,
  TransportDuration,
  InsertTransportDuration,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;

  // Countries
  getCountry(id: number): Promise<Country | undefined>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  listCountries(active?: boolean): Promise<Country[]>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country | undefined>;

  // Cities
  getCity(id: number): Promise<City | undefined>;
  listCities(countryId?: number, active?: boolean): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;

  // Airports
  getAirport(id: number): Promise<Airport | undefined>;
  listAirports(active?: boolean): Promise<Airport[]>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  updateAirport(id: number, airport: Partial<InsertAirport>): Promise<Airport | undefined>;
  deleteAirport(id: number): Promise<boolean>;

  // Destinations
  getDestination(id: number): Promise<Destination | undefined>;
  listDestinations(active?: boolean): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined>;
  deleteDestination(id: number): Promise<boolean>;

  // Transport Types
  listTransportTypes(): Promise<TransportType[]>;

  // Packages
  getPackage(id: number): Promise<Package | undefined>;
  listPackages(active?: boolean): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(
    id: number,
    pkg: Partial<InsertPackage>,
  ): Promise<Package | undefined>;
  deletePackage(id: number): Promise<boolean>;

  // Hotels
  getHotel(id: number): Promise<Hotel | undefined>;
  listHotels(active?: boolean): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(
    id: number,
    hotel: Partial<InsertHotel>,
  ): Promise<Hotel | undefined>;

  // Tours
  getTour(id: number): Promise<Tour | undefined>;
  listTours(active?: boolean): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;

  // Hero Slides
  getActiveHeroSlides(): Promise<HeroSlide[]>;
  createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide>;

  // Homepage Sections
  getHomepageSection(id: number): Promise<any | undefined>;
  listHomepageSections(active?: boolean): Promise<any[]>;
  createHomepageSection(section: any): Promise<any>;
  updateHomepageSection(id: number, section: any): Promise<any | undefined>;
  deleteHomepageSection(id: number): Promise<boolean>;

  // Menus
  getMenu(id: number): Promise<Menu | undefined>;
  getMenuByLocation(location: string): Promise<Menu | undefined>;
  getMenuByName(name: string): Promise<Menu | undefined>;
  listMenus(active?: boolean): Promise<Menu[]>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: number): Promise<boolean>;

  // Package Categories
  listPackageCategories(active?: boolean): Promise<any[]>;
  createPackageCategory(category: any): Promise<any>;
  updatePackageCategory(id: number, category: any): Promise<any>;
  deletePackageCategory(id: number): Promise<boolean>;

  // Menu Items
  getMenuItem(id: number): Promise<any | undefined>;
  listMenuItems(menuId?: number, active?: boolean): Promise<any[]>;
  createMenuItem(item: any): Promise<any>;
  updateMenuItem(id: number, item: any): Promise<any | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;

  // Tour Categories
  listTourCategories(active?: boolean): Promise<any[]>;
  createTourCategory(category: any): Promise<any>;

  // Translations
  listTranslations(): Promise<Translation[]>;
  getTranslation(id: number): Promise<Translation | undefined>;
  getTranslationByKey(key: string): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: number, translation: Partial<InsertTranslation>): Promise<Translation | undefined>;
  deleteTranslation(id: number): Promise<boolean>;

  // Language Settings
  getSiteLanguageSettings(): Promise<any[]>;
  updateSiteLanguageSettings(settings: any): Promise<any>;

  // Hotel Categories
  listHotelCategories(active?: boolean): Promise<any[]>;
  getHotelCategory(id: number): Promise<any | undefined>;
  createHotelCategory(category: any): Promise<any>;
  updateHotelCategory(id: number, category: any): Promise<any | undefined>;
  deleteHotelCategory(id: number): Promise<boolean>;

  // Hotel Features
  listHotelFacilities(): Promise<any[]>;
  getHotelFacility(id: number): Promise<any | undefined>;
  createHotelFacility(facility: any): Promise<any>;
  updateHotelFacility(id: number, facility: any): Promise<any | undefined>;
  deleteHotelFacility(id: number): Promise<boolean>;

  // Hotel Highlights
  listHotelHighlights(): Promise<any[]>;
  getHotelHighlight(id: number): Promise<any | undefined>;
  createHotelHighlight(highlight: any): Promise<any>;
  updateHotelHighlight(id: number, highlight: any): Promise<any | undefined>;
  deleteHotelHighlight(id: number): Promise<boolean>;

  // Cleanliness Features
  listCleanlinessFeatures(): Promise<any[]>;
  getCleanlinessFeature(id: number): Promise<any | undefined>;
  createCleanlinessFeature(feature: any): Promise<any>;
  updateCleanlinessFeature(id: number, feature: any): Promise<any | undefined>;
  deleteCleanlinessFeature(id: number): Promise<boolean>;

  // Why Choose Us Sections
  listWhyChooseUsSections(active?: boolean): Promise<WhyChooseUsSection[]>;
  getWhyChooseUsSection(id: number): Promise<WhyChooseUsSection | undefined>;
  createWhyChooseUsSection(section: InsertWhyChooseUsSection): Promise<WhyChooseUsSection>;
  updateWhyChooseUsSection(id: number, section: Partial<InsertWhyChooseUsSection>): Promise<WhyChooseUsSection | undefined>;
  deleteWhyChooseUsSection(id: number): Promise<boolean>;

  // Room Categories
  listRoomCategories(active?: boolean): Promise<RoomCategory[]>;
  getRoomCategory(id: number): Promise<RoomCategory | undefined>;
  createRoomCategory(category: InsertRoomCategory): Promise<RoomCategory>;
  updateRoomCategory(id: number, category: Partial<InsertRoomCategory>): Promise<RoomCategory | undefined>;
  deleteRoomCategory(id: number): Promise<boolean>;

  // --- Transportation ---
  listTransportation(): Promise<any[]>;
  getTransportation(id: number): Promise<any | undefined>;
  createTransportation(data: any): Promise<any>;
  updateTransportation(id: number, data: any): Promise<any | undefined>;
  deleteTransportation(id: number): Promise<boolean>;

  // --- Transport Locations ---
  listTransportLocations(): Promise<any[]>;
  getTransportLocation(id: number): Promise<any | undefined>;
  createTransportLocation(data: any): Promise<any>;
  updateTransportLocation(id: number, data: any): Promise<any | undefined>;
  deleteTransportLocation(id: number): Promise<boolean>;

  // --- Transport Durations ---
  listTransportDurations(): Promise<any[]>;
  getTransportDuration(id: number): Promise<any | undefined>;
  createTransportDuration(data: any): Promise<any>;
  updateTransportDuration(id: number, data: any): Promise<any | undefined>;
  deleteTransportDuration(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(
    id: number,
    user: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        ...user,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async listUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(asc(users.id));
    } catch (error) {
      console.error("Error listing users:", error);
      return [];
    }
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      const [storedHash, salt] = hashedPassword.split(".");
      if (!salt) return false;

      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const derivedKey = buf.toString("hex");

      return timingSafeEqual(
        Buffer.from(storedHash, "hex"),
        Buffer.from(derivedKey, "hex"),
      );
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  // Countries
  async getCountry(id: number): Promise<Country | undefined> {
    try {
      const [country] = await db
        .select()
        .from(countries)
        .where(eq(countries.id, id));
      return country || undefined;
    } catch (error) {
      console.error("Error getting country:", error);
      return undefined;
    }
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    try {
      const [country] = await db
        .select()
        .from(countries)
        .where(eq(countries.code, code));
      return country || undefined;
    } catch (error) {
      console.error("Error getting country by code:", error);
      return undefined;
    }
  }

  async listCountries(active?: boolean): Promise<Country[]> {
    try {
      console.log('🔍 listCountries called with active:', active);
      let result;
      if (active !== undefined) {
        result = await db
          .select()
          .from(countries)
          .where(eq(countries.active, active))
          .orderBy(asc(countries.name));
      } else {
        result = await db.select().from(countries).orderBy(asc(countries.name));
      }
      console.log('🔍 listCountries returning:', result.length, 'countries');
      console.log('🔍 Sample data:', result[0]);
      return result;
    } catch (error) {
      console.error("Error listing countries:", error);
      return [];
    }
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [created] = await db.insert(countries).values(country).returning();
    return created;
  }

  async updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country | undefined> {
    try {
      const [updated] = await db
        .update(countries)
        .set(country)
        .where(eq(countries.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating country:", error);
      return undefined;
    }
  }

  // Cities
  async getCity(id: number): Promise<City | undefined> {
    try {
      const [city] = await db.select().from(cities).where(eq(cities.id, id));
      return city || undefined;
    } catch (error) {
      console.error("Error getting city:", error);
      return undefined;
    }
  }

  async listCities(countryId?: number, active?: boolean): Promise<City[]> {
    try {
      const conditions = [];
      if (countryId !== undefined) {
        conditions.push(eq(cities.countryId, countryId));
      }
      if (active !== undefined) {
        conditions.push(eq(cities.active, active));
      }

      if (conditions.length > 0) {
        return await db
          .select()
          .from(cities)
          .where(and(...conditions))
          .orderBy(asc(cities.name));
      }
      return await db.select().from(cities).orderBy(asc(cities.name));
    } catch (error) {
      console.error("Error listing cities:", error);
      return [];
    }
  }

  async createCity(city: InsertCity): Promise<City> {
    const [created] = await db.insert(cities).values(city).returning();
    return created;
  }

  // Airports
  async getAirport(id: number): Promise<Airport | undefined> {
    try {
      const [airport] = await db.select().from(airports).where(eq(airports.id, id));
      return airport || undefined;
    } catch (error) {
      console.error("Error getting airport:", error);
      return undefined;
    }
  }

  async listAirports(active?: boolean): Promise<Airport[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(airports)
          .where(eq(airports.active, active))
          .orderBy(asc(airports.name));
      }
      return await db.select().from(airports).orderBy(asc(airports.name));
    } catch (error) {
      console.error("Error listing airports:", error);
      return [];
    }
  }

  async createAirport(airport: InsertAirport): Promise<Airport> {
    const [created] = await db.insert(airports).values(airport).returning();
    return created;
  }

  async updateAirport(id: number, airport: Partial<InsertAirport>): Promise<Airport | undefined> {
    try {
      const [updated] = await db
        .update(airports)
        .set(airport)
        .where(eq(airports.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating airport:", error);
      return undefined;
    }
  }

  async deleteAirport(id: number): Promise<boolean> {
    try {
      const result = await db.delete(airports).where(eq(airports.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting airport:", error);
      return false;
    }
  }

  // Destinations
  async getDestination(id: number): Promise<Destination | undefined> {
    try {
      const [destination] = await db
        .select()
        .from(destinations)
        .where(eq(destinations.id, id));
      return destination || undefined;
    } catch (error) {
      console.error("Error getting destination:", error);
      return undefined;
    }
  }

  async listDestinations(active?: boolean): Promise<Destination[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(destinations)
          .where(eq(destinations.featured, active))
          .orderBy(desc(destinations.createdAt));
      }
      return await db
        .select()
        .from(destinations)
        .orderBy(desc(destinations.createdAt));
    } catch (error) {
      console.error("Error listing destinations:", error);
      return [];
    }
  }

  async listTransportTypes(): Promise<TransportType[]> {
    try {
      return await db
        .select()
        .from(transportTypes)
        .orderBy(transportTypes.name);
    } catch (error) {
      console.error("Error listing transport types:", error);
      return [];
    }
  }

  async createDestination(
    destination: InsertDestination,
  ): Promise<Destination> {
    try {
      const [created] = await db
        .insert(destinations)
        .values(destination)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating destination:", error);
      throw error;
    }
  }

  async updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined> {
    try {
      const [updatedDestination] = await db
        .update(destinations)
        .set(destination)
        .where(eq(destinations.id, id))
        .returning();
      return updatedDestination;
    } catch (error) {
      console.error("Error updating destination:", error);
      return undefined;
    }
  }

  async deleteDestination(id: number): Promise<boolean> {
    try {
      console.log(`Attempting to delete destination with ID: ${id}`);
      const result = await db
        .delete(destinations)
        .where(eq(destinations.id, id));
      
      console.log(`Delete destination result:`, result);
      return true;
    } catch (error) {
      console.error("Error deleting destination:", error);
      return false;
    }
  }

  // Packages
  async getPackage(id: number): Promise<Package | undefined> {
    try {
      const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
      if (!pkg) return undefined;
      
      // If package has room data stored as JSON, enhance it with actual database room details
      if (pkg.rooms && Array.isArray(pkg.rooms)) {
        const enhancedRooms = [];
        for (const roomRef of pkg.rooms as any[]) {
          if (roomRef.id) {
            // Get full room details from database
            const [fullRoom] = await db.select().from(rooms).where(eq(rooms.id, roomRef.id));
            if (fullRoom) {
              enhancedRooms.push({
                ...roomRef,
                maxOccupancy: fullRoom.maxOccupancy,
                maxAdults: fullRoom.maxAdults,
                maxChildren: fullRoom.maxChildren,
                maxInfants: fullRoom.maxInfants,
                capacity: fullRoom.maxOccupancy, // Add capacity field for compatibility
                price: fullRoom.price,
                pricePerNight: fullRoom.price,
                name: fullRoom.name,
                type: fullRoom.type,
                description: fullRoom.description,
                imageUrl: fullRoom.imageUrl
              });
            } else {
              enhancedRooms.push(roomRef);
            }
          } else {
            enhancedRooms.push(roomRef);
          }
        }
        // Return package with enhanced room data
        return { ...pkg, rooms: enhancedRooms };
      }
      
      return pkg;
    } catch (error) {
      console.error("Error getting package:", error);
      return undefined;
    }
  }

  async listPackages(active?: boolean): Promise<Package[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(packages)
          .where(eq(packages.featured, active))
          .orderBy(desc(packages.createdAt));
      }
      return await db.select().from(packages).orderBy(desc(packages.createdAt));
    } catch (error) {
      console.error("Error listing packages:", error);
      return [];
    }
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [created] = await db.insert(packages).values(pkg).returning();
    return created;
  }

  async updatePackage(
    id: number,
    pkg: Partial<InsertPackage>,
  ): Promise<Package | undefined> {
    const [updated] = await db
      .update(packages)
      .set({
        ...pkg,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePackage(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(packages)
        .where(eq(packages.id, id));
      return !!result;
    } catch (error) {
      console.error("Error deleting package:", error);
      return false;
    }
  }

  // Hotels
  async getHotel(id: number): Promise<Hotel | undefined> {
    try {
      const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
      return hotel || undefined;
    } catch (error) {
      console.error("Error getting hotel:", error);
      return undefined;
    }
  }

  async listHotels(active?: boolean): Promise<Hotel[]> {
    try {
      console.log("🏨 Listing hotels with active filter:", active);
      
      if (active !== undefined) {
        const result = await db
          .select()
          .from(hotels)
          .where(eq(hotels.status, active ? "active" : "inactive"))
          .orderBy(desc(hotels.id));
        console.log("✅ Found hotels with active filter:", result.length);
        return result;
      }
      
      const result = await db.select().from(hotels).orderBy(desc(hotels.id));
      console.log("✅ Found total hotels:", result.length);
      return result;
    } catch (error) {
      console.error("❌ Error listing hotels:", error);
      return [];
    }
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    try {
      console.log("Storage createHotel called with data:", hotel.name || "Unnamed Hotel");
      if (hotel.features && Array.isArray(hotel.features) && hotel.features.length > 0) {
        console.log("Hotel features:", hotel.features.length, "items");
      }

      // Ensure JSON fields are properly serialized for JSONB columns
      const processedHotel = {
        ...hotel,
        restaurants: hotel.restaurants || null,
        landmarks: hotel.landmarks || null,
        faqs: hotel.faqs,
        roomTypes: hotel.roomTypes,
        galleryUrls: hotel.galleryUrls,
        amenities: hotel.amenities || null,
        languages: hotel.languages || ["en"],
        features: hotel.features || [], // Add features array for simplified storage
      };

      if (processedHotel.features && Array.isArray(processedHotel.features)) {
        console.log("Processed features ready for insertion:", processedHotel.features.length, "items");
      }

      const [created] = await db
        .insert(hotels)
        .values(processedHotel)
        .returning();
      console.log("Hotel created successfully in storage:", created);
      return created;
    } catch (error) {
      console.error("Database error in createHotel:", error);
      console.error("Hotel data that caused error:", hotel);
      throw error;
    }
  }

  async updateHotel(
    id: number,
    hotel: Partial<InsertHotel>,
  ): Promise<Hotel | undefined> {
    try {
      console.log("Storage updateHotel called for ID:", id);
      console.log("Update data:", hotel);

      const [updated] = await db
        .update(hotels)
        .set(hotel)
        .where(eq(hotels.id, id))
        .returning();

      console.log("Hotel updated successfully in storage:", updated);
      return updated;
    } catch (error) {
      console.error("Database error in updateHotel:", error);
      console.error("Hotel ID:", id);
      console.error("Update data that caused error:", hotel);
      throw error;
    }
  }

  async getHotelWithFeatures(id: number): Promise<any | undefined> {
    try {
      // Get basic hotel data
      const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));

      if (!hotel) {
        return undefined;
      }

      // Get associated features
      const facilityIds = await this.getHotelFeatureAssociations(
        id,
        "facilities",
      );
      const highlightIds = await this.getHotelFeatureAssociations(
        id,
        "highlights",
      );
      const cleanlinessFeatureIds = await this.getHotelFeatureAssociations(
        id,
        "cleanlinessFeatures",
      );

      // Get complex fields from hotel data
      let restaurants = [];
      let landmarks = [];
      let faqs = [];
      let roomTypes = [];

      // Parse restaurants from hotel data if exists
      if (hotel.restaurants && typeof hotel.restaurants === "string") {
        try {
          restaurants = JSON.parse(hotel.restaurants);
        } catch (e) {
          console.log("Error parsing restaurants:", e);
          restaurants = [];
        }
      } else if (Array.isArray(hotel.restaurants)) {
        restaurants = hotel.restaurants;
      }

      // Parse landmarks from hotel data if exists
      if (hotel.landmarks && typeof hotel.landmarks === "string") {
        try {
          landmarks = JSON.parse(hotel.landmarks);
        } catch (e) {
          console.log("Error parsing landmarks:", e);
          landmarks = [];
        }
      } else if (Array.isArray(hotel.landmarks)) {
        landmarks = hotel.landmarks;
      }

      // Parse FAQs from hotel data if exists
      if (hotel.faqs && typeof hotel.faqs === "string") {
        try {
          faqs = JSON.parse(hotel.faqs);
        } catch (e) {
          console.log("Error parsing faqs:", e);
          faqs = [];
        }
      } else if (Array.isArray(hotel.faqs)) {
        faqs = hotel.faqs;
      }

      // Parse room types from hotel data if exists
      if (hotel.roomTypes && typeof hotel.roomTypes === "string") {
        try {
          roomTypes = JSON.parse(hotel.roomTypes);
        } catch (e) {
          console.log("Error parsing room types:", e);
          roomTypes = [];
        }
      } else if (Array.isArray(hotel.roomTypes)) {
        roomTypes = hotel.roomTypes;
      }

      console.log("Hotel with features loaded:", {
        id: hotel.id,
        name: hotel.name,
        restaurantsCount: restaurants.length,
        landmarksCount: landmarks.length,
        faqsCount: faqs.length,
        roomTypesCount: roomTypes.length,
      });

      return {
        ...hotel,
        facilityIds,
        highlightIds,
        cleanlinessFeatureIds,
        // Also include the actual feature objects for backwards compatibility
        facilities: facilityIds,
        highlights: highlightIds,
        cleanlinessFeatures: cleanlinessFeatureIds,
        // Include complex data
        restaurants,
        landmarks,
        faqs,
        roomTypes,
      };
    } catch (error) {
      console.error("Error fetching hotel with features:", error);
      return await this.getHotel(id);
    }
  }

  async getHotelFeatureAssociations(
    hotelId: number,
    featureType: string,
  ): Promise<number[]> {
    try {
      const client = await pool.connect();
      let result;

      switch (featureType) {
        case "facilities":
          result = await client.query(
            "SELECT facility_id FROM hotel_to_facilities WHERE hotel_id = $1",
            [hotelId],
          );
          client.release();
          return result.rows.map((row) => row.facility_id);

        case "highlights":
          result = await client.query(
            "SELECT highlight_id FROM hotel_to_highlights WHERE hotel_id = $1",
            [hotelId],
          );
          client.release();
          return result.rows.map((row) => row.highlight_id);

        case "cleanlinessFeatures":
          result = await client.query(
            "SELECT feature_id FROM hotel_to_cleanliness WHERE hotel_id = $1",
            [hotelId],
          );
          client.release();
          return result.rows.map((row) => row.feature_id);

        default:
          client.release();
          return [];
      }
    } catch (error) {
      console.error(`Error fetching hotel ${featureType}:`, error);
      return [];
    }
  }

  async updateHotelFeatureAssociations(
    hotelId: number,
    featureType: string,
    featureIds: number[],
  ): Promise<void> {
    try {
      console.log(
        `Updating hotel ${featureType} for hotel ${hotelId}:`,
        featureIds,
      );

      // Delete existing associations first
      switch (featureType) {
        case "facilities":
          await db.delete(hotelToFacilities).where(eq(hotelToFacilities.hotelId, hotelId));
          if (featureIds.length > 0) {
            const values = featureIds.map(facilityId => ({
              hotelId,
              facilityId
            }));
            await db.insert(hotelToFacilities).values(values);
          }
          break;

        case "highlights":
          await db.delete(hotelToHighlights).where(eq(hotelToHighlights.hotelId, hotelId));
          if (featureIds.length > 0) {
            const values = featureIds.map(highlightId => ({
              hotelId,
              highlightId
            }));
            await db.insert(hotelToHighlights).values(values);
          }
          break;

        case "cleanlinessFeatures":
          await db.delete(hotelToCleanlinessFeatures).where(eq(hotelToCleanlinessFeatures.hotelId, hotelId));
          if (featureIds.length > 0) {
            const values = featureIds.map(featureId => ({
              hotelId,
              featureId
            }));
            await db.insert(hotelToCleanlinessFeatures).values(values);
          }
          break;

        default:
          console.warn(`Unknown feature type: ${featureType}`);
      }

      console.log(`Successfully updated ${featureType} associations for hotel ${hotelId}`);
    } catch (error) {
      console.error(`Error updating hotel ${featureType}:`, error);
      throw error;
    }
  }

  // Tours
  async getTour(id: number): Promise<Tour | undefined> {
    try {
      const [tour] = await db.select().from(tours).where(eq(tours.id, id));
      return tour || undefined;
    } catch (error) {
      console.error("Error getting tour:", error);
      return undefined;
    }
  }

  async listTours(active?: boolean): Promise<Tour[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(tours)
          .where(eq(tours.active, active))
          .orderBy(desc(tours.createdAt));
      }
      return await db.select().from(tours).orderBy(desc(tours.createdAt));
    } catch (error) {
      console.error("Error listing tours:", error);
      return [];
    }
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    try {
      console.log('Creating tour with data:', JSON.stringify(tour, null, 2));
      
      // Create a safe copy with proper processing for database insertion
      const processedTour: any = { ...tour };
      
      // Ensure title is set if missing (copy from name)
      if (!processedTour.title && processedTour.name) {
        processedTour.title = processedTour.name;
      }
      
      // Handle JSON fields - ensure they're properly serialized for PostgreSQL JSONB
      const jsonFields = ['galleryUrls', 'included', 'excluded', 'includedAr', 'excludedAr'];
      for (const field of jsonFields) {
        if (processedTour[field] !== undefined && processedTour[field] !== null) {
          // If it's already an array or object, stringify it for PostgreSQL JSONB
          if (Array.isArray(processedTour[field]) || typeof processedTour[field] === 'object') {
            // PostgreSQL JSONB can handle arrays/objects directly in Drizzle
            // Keep as is - Drizzle will handle the serialization
          } else if (typeof processedTour[field] === 'string') {
            try {
              // If it's a string that looks like JSON, parse it first
              processedTour[field] = JSON.parse(processedTour[field]);
            } catch (e) {
              // If parsing fails, wrap string in array
              processedTour[field] = [processedTour[field]];
            }
          }
        } else {
          // Set null values to empty arrays for consistency
          processedTour[field] = [];
        }
      }
      
      // Clean up any undefined values that could cause issues
      Object.keys(processedTour).forEach(key => {
        if (processedTour[key] === undefined) {
          delete processedTour[key];
        }
      });
      
      console.log('Processed tour data before insert:', JSON.stringify(processedTour, null, 2));
      
      const [created] = await db.insert(tours).values(processedTour).returning();
      return created;
    } catch (error) {
      console.error('Error in createTour:', error);
      throw error;
    }
  }

  async updateTour(
    id: number,
    tour: Partial<InsertTour>,
  ): Promise<Tour | undefined> {
    try {
      const [updatedTour] = await db
        .update(tours)
        .set({
          ...tour,
          updatedAt: new Date(),
        })
        .where(eq(tours.id, id))
        .returning();
      return updatedTour || undefined;
    } catch (error) {
      console.error("Error updating tour:", error);
      return undefined;
    }
  }

  async deleteTour(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(tours)
        .where(eq(tours.id, id));
      return true; // Drizzle ORM doesn't return affected rows count like this
    } catch (error) {
      console.error("Error deleting tour:", error);
      return false;
    }
  }

  // Hero Slides
  async getActiveHeroSlides(): Promise<HeroSlide[]> {
    try {
      console.log("Storage: Attempting to fetch hero slides...");
      const slides = await db
        .select()
        .from(heroSlides)
        .where(eq(heroSlides.active, true))
        .orderBy(asc(heroSlides.order));
      console.log("Storage: Successfully fetched hero slides:", slides.length);
      return slides;
    } catch (error) {
      console.error("Storage: Error getting active hero slides:", error);
      return []; // Return empty array instead of throwing to prevent API failures
    }
  }

  async createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide> {
    const [created] = await db.insert(heroSlides).values(slide).returning();
    return created;
  }

  // Homepage Sections
  async getHomepageSection(id: number): Promise<HomepageSection | undefined> {
    try {
      const [section] = await db
        .select()
        .from(homepageSections)
        .where(eq(homepageSections.id, id));
      return section || undefined;
    } catch (error) {
      console.error("Error getting homepage section:", error);
      return undefined;
    }
  }

  async listHomepageSections(active?: boolean): Promise<HomepageSection[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(homepageSections)
          .where(eq(homepageSections.active, active))
          .orderBy(asc(homepageSections.order));
      }
      
      return await db
        .select()
        .from(homepageSections)
        .orderBy(asc(homepageSections.order));
    } catch (error) {
      console.error("Error listing homepage sections:", error);
      return [];
    }
  }

  async createHomepageSection(section: InsertHomepageSection): Promise<HomepageSection> {
    try {
      const [created] = await db.insert(homepageSections).values(section).returning();
      return created;
    } catch (error) {
      console.error("Error creating homepage section:", error);
      throw error;
    }
  }

  async updateHomepageSection(id: number, section: Partial<InsertHomepageSection>): Promise<HomepageSection | undefined> {
    try {
      const [updated] = await db
        .update(homepageSections)
        .set({
          ...section,
          updatedAt: new Date(),
        })
        .where(eq(homepageSections.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating homepage section:", error);
      return undefined;
    }
  }

  async deleteHomepageSection(id: number): Promise<boolean> {
    try {
      await db.delete(homepageSections).where(eq(homepageSections.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting homepage section:", error);
      return false;
    }
  }

  // Menus
  async getMenu(id: number): Promise<Menu | undefined> {
    try {
      const [menu] = await db
        .select()
        .from(menus)
        .where(eq(menus.id, id));
      return menu || undefined;
    } catch (error) {
      console.error("Error getting menu by id:", error);
      return undefined;
    }
  }

  async getMenuByLocation(location: string): Promise<Menu | undefined> {
    try {
      console.log("🔥 STORAGE: getMenuByLocation called with location:", location);
      const result = await db
        .select()
        .from(menus)
        .where(eq(menus.location, location));
      console.log("🔥 STORAGE: getMenuByLocation query returned:", result.length, "results");
      console.log("🔥 STORAGE: Found menu:", result[0] ? JSON.stringify(result[0]) : "None");
      return result[0] || undefined;
    } catch (error) {
      console.error("❌ STORAGE ERROR getting menu by location:", error);
      console.error("❌ Stack trace:", (error as Error).stack);
      return undefined;
    }
  }

  async getMenuByName(name: string): Promise<Menu | undefined> {
    try {
      const [menu] = await db
        .select()
        .from(menus)
        .where(eq(menus.name, name));
      return menu || undefined;
    } catch (error) {
      console.error("Error getting menu by name:", error);
      return undefined;
    }
  }

  async listMenus(active?: boolean): Promise<Menu[]> {
    try {
      console.log("🔥 STORAGE: listMenus called with active filter:", active);
      
      let result;
      if (active !== undefined) {
        console.log("🔥 STORAGE: Querying with active filter =", active);
        result = await db
          .select()
          .from(menus)
          .where(eq(menus.active, active))
          .orderBy(asc(menus.name));
        console.log("🔥 STORAGE: Query with filter returned:", result.length, "menus");
      } else {
        console.log("🔥 STORAGE: Querying all menus without filter");
        result = await db
          .select()
          .from(menus)
          .orderBy(asc(menus.name));
        console.log("🔥 STORAGE: Query without filter returned:", result.length, "menus");
      }
      
      console.log("🔥 STORAGE: First menu item:", result[0] ? JSON.stringify(result[0]) : "None");
      return result;
    } catch (error) {
      console.error("❌ STORAGE ERROR listing menus:", error);
      console.error("❌ Stack trace:", (error as Error).stack);
      return [];
    }
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [created] = await db.insert(menus).values(menu).returning();
    return created;
  }

  async updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined> {
    try {
      const [updated] = await db
        .update(menus)
        .set(menu)
        .where(eq(menus.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating menu:", error);
      return undefined;
    }
  }

  async deleteMenu(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(menus)
        .where(eq(menus.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting menu:", error);
      return false;
    }
  }

  // Package Categories
  async listPackageCategories(active?: boolean): Promise<any[]> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT * FROM package_categories ORDER BY name",
      );
      client.release();
      return result.rows || [];
    } catch (error) {
      console.error("Error listing package categories:", error);
      return [];
    }
  }

  async createPackageCategory(category: any): Promise<any> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "INSERT INTO package_categories (name, description, active) VALUES ($1, $2, $3) RETURNING *",
        [
          category.name,
          category.description || null,
          category.active !== false,
        ],
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating package category:", error);
      throw error;
    }
  }

  async updatePackageCategory(id: number, category: any): Promise<any> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "UPDATE package_categories SET name = $1, description = $2, active = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
        [
          category.name,
          category.description || null,
          category.active !== false,
          id,
        ],
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error updating package category:", error);
      throw error;
    }
  }

  async deletePackageCategory(id: number): Promise<boolean> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "DELETE FROM package_categories WHERE id = $1",
        [id],
      );
      client.release();
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting package category:", error);
      return false;
    }
  }

  // Menu Items
  async listMenuItems(menuId?: number, active?: boolean): Promise<any[]> {
    try {
      const client = await pool.connect();
      let result;
      let query = 'SELECT * FROM menu_items';
      let params: any[] = [];
      let conditions: string[] = [];
      
      if (menuId !== undefined) {
        conditions.push('menu_id = $' + (params.length + 1));
        params.push(menuId);
      }
      
      if (active !== undefined) {
        conditions.push('active = $' + (params.length + 1));
        params.push(active);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY "order"';
      
      result = await client.query(query, params);
      client.release();
      return result.rows || [];
    } catch (error) {
      console.error("Error listing menu items:", error);
      return [];
    }
  }

  async createMenuItem(item: any): Promise<any> {
    try {
      const client = await pool.connect();
      console.log('Creating menu item with data:', item);
      console.log('Order value:', item.order);
      const result = await client.query(
        'INSERT INTO menu_items (menu_id, parent_id, title, url, icon, "order", active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          item.menuId,
          item.parentId || null,
          item.title,
          item.url || null,
          item.icon || null,
          item.orderPosition || 0,
          item.active !== false,
        ],
      );
      client.release();
      console.log('Menu item created successfully:', result.rows[0]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating menu item:", error);
      console.error("Error details:", (error as Error).message);
      throw error;
    }
  }

  async getMenuItem(id: number): Promise<any | undefined> {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM menu_items WHERE id = $1', [id]);
      client.release();
      return result.rows[0] || undefined;
    } catch (error) {
      console.error("Error getting menu item:", error);
      return undefined;
    }
  }

  async updateMenuItem(id: number, item: any): Promise<any | undefined> {
    try {
      const client = await pool.connect();
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      if (item.title !== undefined) {
        setClause.push(`title = $${paramIndex++}`);
        values.push(item.title);
      }
      if (item.url !== undefined) {
        setClause.push(`url = $${paramIndex++}`);
        values.push(item.url);
      }
      if (item.icon !== undefined) {
        setClause.push(`icon = $${paramIndex++}`);
        values.push(item.icon);
      }
      if (item.parentId !== undefined) {
        setClause.push(`parent_id = $${paramIndex++}`);
        values.push(item.parentId);
      }
      if (item.orderPosition !== undefined) {
        setClause.push(`"order" = $${paramIndex++}`);
        values.push(item.orderPosition);
      }
      if (item.active !== undefined) {
        setClause.push(`active = $${paramIndex++}`);
        values.push(item.active);
      }

      if (setClause.length === 0) {
        return undefined;
      }

      values.push(id);
      const query = `UPDATE menu_items SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      
      const result = await client.query(query, values);
      client.release();
      return result.rows[0] || undefined;
    } catch (error) {
      console.error("Error updating menu item:", error);
      return undefined;
    }
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      const client = await pool.connect();
      const result = await client.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
      client.release();
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  }

  // Tour Categories
  async listTourCategories(active?: boolean): Promise<any[]> {
    try {
      const client = await pool.connect();
      let result;
      if (active !== undefined) {
        result = await client.query(
          "SELECT * FROM tour_categories WHERE active = $1 ORDER BY name",
          [active],
        );
      } else {
        result = await client.query(
          "SELECT * FROM tour_categories ORDER BY name",
        );
      }
      client.release();
      return result.rows || [];
    } catch (error) {
      console.error("Error listing tour categories:", error);
      return [];
    }
  }

  async createTourCategory(category: any): Promise<any> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "INSERT INTO tour_categories (name, description, active) VALUES ($1, $2, $3) RETURNING *",
        [
          category.name,
          category.description || null,
          category.active !== false,
        ],
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating tour category:", error);
      throw error;
    }
  }

  // Translations
  async listTranslations(): Promise<Translation[]> {
    try {
      return await db.select().from(translations).orderBy(asc(translations.key));
    } catch (error) {
      console.error("Error listing translations:", error);
      return [];
    }
  }

  async getTranslation(id: number): Promise<Translation | undefined> {
    try {
      const result = await db.select().from(translations).where(eq(translations.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting translation:", error);
      return undefined;
    }
  }

  async getTranslationByKey(key: string): Promise<Translation | undefined> {
    try {
      const result = await db.select().from(translations).where(eq(translations.key, key));
      return result[0];
    } catch (error) {
      console.error("Error getting translation by key:", error);
      return undefined;
    }
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    try {
      const result = await db.insert(translations).values(translation).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating translation:", error);
      throw error;
    }
  }

  async updateTranslation(id: number, translation: Partial<InsertTranslation>): Promise<Translation | undefined> {
    try {
      const result = await db
        .update(translations)
        .set({ ...translation, updatedAt: new Date() })
        .where(eq(translations.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating translation:", error);
      return undefined;
    }
  }

  async deleteTranslation(id: number): Promise<boolean> {
    try {
      const result = await db.delete(translations).where(eq(translations.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting translation:", error);
      return false;
    }
  }

  // Language Settings
  async getSiteLanguageSettings(): Promise<any[]> {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM site_language_settings");
      client.release();
      return result.rows || [];
    } catch (error) {
      console.error("Error getting site language settings:", error);
      return [];
    }
  }

  async updateSiteLanguageSettings(settings: any): Promise<any> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "UPDATE site_language_settings SET default_language = $1 WHERE id = 1 RETURNING *",
        [settings.defaultLanguage || "en"],
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error updating site language settings:", error);
      return undefined;
    }
  }

  // Rooms management
  async listRooms(hotelId?: number): Promise<any[]> {
    try {
      console.log("🔍 Listing rooms with hotelId:", hotelId);

      // Always use raw SQL for reliability
      const client = await pool.connect();
      const sqlQuery = hotelId
        ? "SELECT * FROM rooms WHERE hotel_id = $1 ORDER BY created_at DESC"
        : "SELECT * FROM rooms ORDER BY created_at DESC";

      const params = hotelId ? [hotelId] : [];
      const result = await client.query(sqlQuery, params);
      client.release();

      console.log("✅ Rooms query result:", result.rows.length, "rooms found");
      if (result.rows.length > 0) {
        console.log("📋 Sample room:", {
          id: result.rows[0].id,
          name: result.rows[0].name,
          hotel_id: result.rows[0].hotel_id,
        });
      }

      return result.rows || [];
    } catch (error) {
      console.error("❌ Error listing rooms:", error);
      return [];
    }
  }

  async createRoom(room: any): Promise<any> {
    try {
      const [newRoom] = await db
        .insert(rooms)
        .values({
          name: room.name,
          description: room.description,
          hotelId: room.hotelId,
          type: room.type,
          maxOccupancy: room.maxOccupancy,
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren || 0,
          maxInfants: room.maxInfants || 0,
          price: room.price,
          discountedPrice: room.discountedPrice,
          currency: room.currency || "EGP",
          imageUrl: room.imageUrl,
          size: room.size,
          bedType: room.bedType,
          amenities: room.amenities,
          view: room.view,
          available: room.available !== false,
          status: room.status || "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newRoom;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  async updateRoom(id: number, room: any): Promise<any> {
    try {
      const [updatedRoom] = await db
        .update(rooms)
        .set({
          name: room.name,
          description: room.description,
          hotelId: room.hotelId,
          type: room.type,
          maxOccupancy: room.maxOccupancy,
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren || 0,
          maxInfants: room.maxInfants || 0,
          price: room.price,
          discountedPrice: room.discountedPrice,
          currency: room.currency || "EGP",
          imageUrl: room.imageUrl,
          size: room.size,
          bedType: room.bedType,
          amenities: room.amenities,
          view: room.view,
          available: room.available !== false,
          status: room.status || "active",
          updatedAt: new Date(),
        })
        .where(eq(rooms.id, id))
        .returning();
      return updatedRoom;
    } catch (error) {
      console.error("Error updating room:", error);
      throw error;
    }
  }

  async getRoom(id: number): Promise<any | undefined> {
    try {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
      return room;
    } catch (error) {
      console.error("Error getting room:", error);
      return undefined;
    }
  }

  async getRoomsByHotel(hotelId: number): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(rooms)
        .where(eq(rooms.hotelId, hotelId))
        .orderBy(rooms.createdAt);
      return result || [];
    } catch (error) {
      console.error("Error getting rooms by hotel:", error);
      return [];
    }
  }

  async deleteRoom(id: number): Promise<boolean> {
    try {
      await db.delete(rooms).where(eq(rooms.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      return false;
    }
  }

  // Hotel Facilities methods
  async listHotelFacilities(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(hotelFacilities)
        .orderBy(hotelFacilities.name);
    } catch (error) {
      console.error("Error listing hotel facilities:", error);
      return [];
    }
  }

  async getHotelFacility(id: number): Promise<any | undefined> {
    try {
      const [facility] = await db
        .select()
        .from(hotelFacilities)
        .where(eq(hotelFacilities.id, id));
      return facility;
    } catch (error) {
      console.error("Error getting hotel facility:", error);
      return undefined;
    }
  }

  async createHotelFacility(facility: any): Promise<any> {
    try {
      const [newFacility] = await db
        .insert(hotelFacilities)
        .values({
          name: facility.name,
          description: facility.description,
          icon: facility.icon,
          category: facility.category,
          active: facility.active !== undefined ? facility.active : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newFacility;
    } catch (error) {
      console.error("Error creating hotel facility:", error);
      throw error;
    }
  }

  async updateHotelFacility(
    id: number,
    facility: any,
  ): Promise<any | undefined> {
    try {
      const [updatedFacility] = await db
        .update(hotelFacilities)
        .set({
          name: facility.name,
          description: facility.description,
          icon: facility.icon,
          category: facility.category,
          active: facility.active,
          updatedAt: new Date(),
        })
        .where(eq(hotelFacilities.id, id))
        .returning();
      return updatedFacility;
    } catch (error) {
      console.error(`Error updating hotel facility with ID ${id}:`, error);
      return undefined;
    }
  }

  async deleteHotelFacility(id: number): Promise<boolean> {
    try {
      await db.delete(hotelFacilities).where(eq(hotelFacilities.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting hotel facility with ID ${id}:`, error);
      return false;
    }
  }

  // Hotel Highlights methods
  async listHotelHighlights(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(hotelHighlights)
        .orderBy(hotelHighlights.name);
    } catch (error) {
      console.error("Error listing hotel highlights:", error);
      return [];
    }
  }

  async getHotelHighlight(id: number): Promise<any | undefined> {
    try {
      const [highlight] = await db
        .select()
        .from(hotelHighlights)
        .where(eq(hotelHighlights.id, id));
      return highlight;
    } catch (error) {
      console.error("Error getting hotel highlight:", error);
      return undefined;
    }
  }

  async createHotelHighlight(highlight: any): Promise<any> {
    try {
      const [newHighlight] = await db
        .insert(hotelHighlights)
        .values({
          name: highlight.name,
          description: highlight.description,
          icon: highlight.icon,
          active: highlight.active !== undefined ? highlight.active : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newHighlight;
    } catch (error) {
      console.error("Error creating hotel highlight:", error);
      throw error;
    }
  }

  async updateHotelHighlight(
    id: number,
    highlight: any,
  ): Promise<any | undefined> {
    try {
      const [updatedHighlight] = await db
        .update(hotelHighlights)
        .set({
          name: highlight.name,
          description: highlight.description,
          icon: highlight.icon,
          active: highlight.active,
          updatedAt: new Date(),
        })
        .where(eq(hotelHighlights.id, id))
        .returning();
      return updatedHighlight;
    } catch (error) {
      console.error(`Error updating hotel highlight with ID ${id}:`, error);
      return undefined;
    }
  }

  async deleteHotelHighlight(id: number): Promise<boolean> {
    try {
      await db.delete(hotelHighlights).where(eq(hotelHighlights.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting hotel highlight with ID ${id}:`, error);
      return false;
    }
  }

  // Cleanliness Features methods
  async listCleanlinessFeatures(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(cleanlinessFeatures)
        .orderBy(cleanlinessFeatures.name);
    } catch (error) {
      console.error("Error listing cleanliness features:", error);
      return [];
    }
  }

  async getCleanlinessFeature(id: number): Promise<any | undefined> {
    try {
      const [feature] = await db
        .select()
        .from(cleanlinessFeatures)
        .where(eq(cleanlinessFeatures.id, id));
      return feature;
    } catch (error) {
      console.error("Error getting cleanliness feature:", error);
      return undefined;
    }
  }

  async createCleanlinessFeature(feature: any): Promise<any> {
    try {
      const [newFeature] = await db
        .insert(cleanlinessFeatures)
        .values({
          name: feature.name,
          description: feature.description,
          icon: feature.icon,
          active: feature.active !== undefined ? feature.active : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newFeature;
    } catch (error) {
      console.error("Error creating cleanliness feature:", error);
      throw error;
    }
  }

  async updateCleanlinessFeature(
    id: number,
    feature: any,
  ): Promise<any | undefined> {
    try {
      const [updatedFeature] = await db
        .update(cleanlinessFeatures)
        .set({
          name: feature.name,
          description: feature.description,
          icon: feature.icon,
          active: feature.active,
          updatedAt: new Date(),
        })
        .where(eq(cleanlinessFeatures.id, id))
        .returning();
      return updatedFeature;
    } catch (error) {
      console.error(`Error updating cleanliness feature with ID ${id}:`, error);
      return undefined;
    }
  }

  async deleteCleanlinessFeature(id: number): Promise<boolean> {
    try {
      await db
        .delete(cleanlinessFeatures)
        .where(eq(cleanlinessFeatures.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting cleanliness feature with ID ${id}:`, error);
      return false;
    }
  }

  // Hotel Categories methods
  async listHotelCategories(active?: boolean): Promise<any[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(hotelCategories)
          .where(eq(hotelCategories.active, active))
          .orderBy(hotelCategories.name);
      }
      
      return await db
        .select()
        .from(hotelCategories)
        .orderBy(hotelCategories.name);
    } catch (error) {
      console.error("Error listing hotel categories:", error);
      return [];
    }
  }

  async getHotelCategory(id: number): Promise<any | undefined> {
    try {
      const [category] = await db
        .select()
        .from(hotelCategories)
        .where(eq(hotelCategories.id, id));
      return category;
    } catch (error) {
      console.error("Error getting hotel category:", error);
      return undefined;
    }
  }

  async createHotelCategory(category: any): Promise<any> {
    try {
      const [newCategory] = await db
        .insert(hotelCategories)
        .values({
          name: category.name,
          description: category.description,
          active: category.active !== undefined ? category.active : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating hotel category:", error);
      throw error;
    }
  }

  async updateHotelCategory(
    id: number,
    category: any,
  ): Promise<any | undefined> {
    try {
      const [updatedCategory] = await db
        .update(hotelCategories)
        .set({
          name: category.name,
          description: category.description,
          active: category.active,
          updatedAt: new Date(),
        })
        .where(eq(hotelCategories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Error updating hotel category:", error);
      throw error;
    }
  }

  async deleteHotelCategory(id: number): Promise<boolean> {
    try {
      await db.delete(hotelCategories).where(eq(hotelCategories.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting hotel category with ID ${id}:`, error);
      return false;
    }
  }

  // Why Choose Us Sections
  async listWhyChooseUsSections(active?: boolean): Promise<WhyChooseUsSection[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(whyChooseUsSections)
          .where(eq(whyChooseUsSections.active, active))
          .orderBy(asc(whyChooseUsSections.orderPosition));
      }
      
      return await db
        .select()
        .from(whyChooseUsSections)
        .orderBy(asc(whyChooseUsSections.orderPosition));
    } catch (error) {
      console.error("Error listing why choose us sections:", error);
      return [];
    }
  }

  async getWhyChooseUsSection(id: number): Promise<WhyChooseUsSection | undefined> {
    try {
      const [section] = await db
        .select()
        .from(whyChooseUsSections)
        .where(eq(whyChooseUsSections.id, id));
      return section || undefined;
    } catch (error) {
      console.error("Error getting why choose us section:", error);
      return undefined;
    }
  }

  async createWhyChooseUsSection(section: InsertWhyChooseUsSection): Promise<WhyChooseUsSection> {
    try {
      const [newSection] = await db
        .insert(whyChooseUsSections)
        .values({
          ...section,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newSection;
    } catch (error) {
      console.error("Error creating why choose us section:", error);
      throw error;
    }
  }

  async updateWhyChooseUsSection(
    id: number,
    section: Partial<InsertWhyChooseUsSection>
  ): Promise<WhyChooseUsSection | undefined> {
    try {
      const [updatedSection] = await db
        .update(whyChooseUsSections)
        .set({
          ...section,
          updatedAt: new Date(),
        })
        .where(eq(whyChooseUsSections.id, id))
        .returning();
      return updatedSection;
    } catch (error) {
      console.error("Error updating why choose us section:", error);
      throw error;
    }
  }

  async deleteWhyChooseUsSection(id: number): Promise<boolean> {
    try {
      await db.delete(whyChooseUsSections).where(eq(whyChooseUsSections.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting why choose us section with ID ${id}:`, error);
      return false;
    }
  }

  // Room Categories
  async listRoomCategories(active?: boolean): Promise<RoomCategory[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(roomCategories)
          .where(eq(roomCategories.active, active))
          .orderBy(asc(roomCategories.name));
      }
      
      return await db
        .select()
        .from(roomCategories)
        .orderBy(asc(roomCategories.name));
    } catch (error) {
      console.error("Error listing room categories:", error);
      return [];
    }
  }

  async getRoomCategory(id: number): Promise<RoomCategory | undefined> {
    try {
      const [category] = await db
        .select()
        .from(roomCategories)
        .where(eq(roomCategories.id, id));
      return category || undefined;
    } catch (error) {
      console.error("Error getting room category:", error);
      return undefined;
    }
  }

  async createRoomCategory(category: InsertRoomCategory): Promise<RoomCategory> {
    try {
      const [newCategory] = await db
        .insert(roomCategories)
        .values({
          ...category,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating room category:", error);
      throw error;
    }
  }

  async updateRoomCategory(
    id: number,
    category: Partial<InsertRoomCategory>
  ): Promise<RoomCategory | undefined> {
    try {
      const [updatedCategory] = await db
        .update(roomCategories)
        .set({
          ...category,
          updatedAt: new Date(),
        })
        .where(eq(roomCategories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Error updating room category:", error);
      throw error;
    }
  }

  async deleteRoomCategory(id: number): Promise<boolean> {
    try {
      await db.delete(roomCategories).where(eq(roomCategories.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting room category with ID ${id}:`, error);
      return false;
    }
  }

  // --- Transportation ---
  async listTransportation(): Promise<any[]> {
    try {
      return await db.select().from(transportation).orderBy(transportation.id);
    } catch (error) {
      console.error("Error listing transportation:", error);
      return [];
    }
  }

  async getTransportation(id: number): Promise<any | undefined> {
    try {
      const [item] = await db.select().from(transportation).where(eq(transportation.id, id));
      return item || undefined;
    } catch (error) {
      console.error("Error getting transportation:", error);
      return undefined;
    }
  }

  async createTransportation(data: any): Promise<any> {
    try {
      const [created] = await db.insert(transportation).values(data).returning();
      return created;
    } catch (error) {
      console.error("Error creating transportation:", error);
      throw error;
    }
  }

  async updateTransportation(id: number, data: any): Promise<any | undefined> {
    try {
      const [updated] = await db.update(transportation).set(data).where(eq(transportation.id, id)).returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating transportation:", error);
      return undefined;
    }
  }

  async deleteTransportation(id: number): Promise<boolean> {
    try {
      await db.delete(transportation).where(eq(transportation.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting transportation:", error);
      return false;
    }
  }

  // --- Transport Locations ---
  async listTransportLocations(): Promise<any[]> {
    try {
      return await db.select().from(transportLocations).orderBy(transportLocations.id);
    } catch (error) {
      console.error("Error listing transport locations:", error);
      return [];
    }
  }

  async getTransportLocation(id: number): Promise<any | undefined> {
    try {
      const [item] = await db.select().from(transportLocations).where(eq(transportLocations.id, id));
      return item || undefined;
    } catch (error) {
      console.error("Error getting transport location:", error);
      return undefined;
    }
  }

  async createTransportLocation(data: any): Promise<any> {
    try {
      const [created] = await db.insert(transportLocations).values(data).returning();
      return created;
    } catch (error) {
      console.error("Error creating transport location:", error);
      throw error;
    }
  }

  async updateTransportLocation(id: number, data: any): Promise<any | undefined> {
    try {
      const [updated] = await db.update(transportLocations).set(data).where(eq(transportLocations.id, id)).returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating transport location:", error);
      return undefined;
    }
  }

  async deleteTransportLocation(id: number): Promise<boolean> {
    try {
      await db.delete(transportLocations).where(eq(transportLocations.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting transport location:", error);
      return false;
    }
  }

  // --- Transport Durations ---
  async listTransportDurations(): Promise<any[]> {
    try {
      return await db.select().from(transportDurations).orderBy(transportDurations.id);
    } catch (error) {
      console.error("Error listing transport durations:", error);
      return [];
    }
  }

  async getTransportDuration(id: number): Promise<any | undefined> {
    try {
      const [item] = await db.select().from(transportDurations).where(eq(transportDurations.id, id));
      return item || undefined;
    } catch (error) {
      console.error("Error getting transport duration:", error);
      return undefined;
    }
  }

  async createTransportDuration(data: any): Promise<any> {
    try {
      const [created] = await db.insert(transportDurations).values(data).returning();
      return created;
    } catch (error) {
      console.error("Error creating transport duration:", error);
      throw error;
    }
  }

  async updateTransportDuration(id: number, data: any): Promise<any | undefined> {
    try {
      const [updated] = await db.update(transportDurations).set(data).where(eq(transportDurations.id, id)).returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating transport duration:", error);
      return undefined;
    }
  }

  async deleteTransportDuration(id: number): Promise<boolean> {
    try {
      await db.delete(transportDurations).where(eq(transportDurations.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting transport duration:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();

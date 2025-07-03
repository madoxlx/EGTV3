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
  heroSlides,
  HeroSlide,
  InsertHeroSlide,
  menus,
  Menu,
  InsertMenu,
  hotelFacilities,
  hotelHighlights,
  cleanlinessFeatures,
  hotelCategories,
  hotelToFacilities,
  hotelToHighlights,
  hotelToCleanlinessFeatures,
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
  listCountries(active?: boolean): Promise<Country[]>;
  createCountry(country: InsertCountry): Promise<Country>;

  // Cities
  getCity(id: number): Promise<City | undefined>;
  listCities(countryId?: number, active?: boolean): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;

  // Destinations
  getDestination(id: number): Promise<Destination | undefined>;
  listDestinations(active?: boolean): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;

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

  // Hero Slides
  getActiveHeroSlides(): Promise<HeroSlide[]>;
  createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide>;

  // Menus
  getMenuByLocation(location: string): Promise<Menu | undefined>;
  listMenus(): Promise<Menu[]>;
  createMenu(menu: InsertMenu): Promise<Menu>;

  // Package Categories
  listPackageCategories(active?: boolean): Promise<any[]>;
  createPackageCategory(category: any): Promise<any>;

  // Menu Items
  listMenuItems(menuId?: number): Promise<any[]>;
  createMenuItem(item: any): Promise<any>;

  // Tour Categories
  listTourCategories(active?: boolean): Promise<any[]>;
  createTourCategory(category: any): Promise<any>;

  // Translations
  listTranslations(language?: string): Promise<any[]>;
  createTranslation(translation: any): Promise<any>;

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

  async listCountries(active?: boolean): Promise<Country[]> {
    try {
      if (active !== undefined) {
        return await db
          .select()
          .from(countries)
          .where(eq(countries.active, active))
          .orderBy(asc(countries.name));
      }
      return await db.select().from(countries).orderBy(asc(countries.name));
    } catch (error) {
      console.error("Error listing countries:", error);
      return [];
    }
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [created] = await db.insert(countries).values(country).returning();
    return created;
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

  async createDestination(
    destination: InsertDestination,
  ): Promise<Destination> {
    const [created] = await db
      .insert(destinations)
      .values(destination)
      .returning();
    return created;
  }

  // Packages
  async getPackage(id: number): Promise<Package | undefined> {
    try {
      const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
      return pkg || undefined;
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
      // First check if country_id column exists, if not, add it
      const client = await pool.connect();
      try {
        await client.query(`
          ALTER TABLE hotels 
          ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id)
        `);
      } catch (alterError) {
        console.log(
          "Country ID column may already exist or table structure issue:",
          alterError.message,
        );
      }
      client.release();

      if (active !== undefined) {
        return await db
          .select()
          .from(hotels)
          .where(eq(hotels.status, active ? "active" : "inactive"))
          .orderBy(desc(hotels.createdAt));
      }
      return await db.select().from(hotels).orderBy(desc(hotels.createdAt));
    } catch (error) {
      console.error("Error listing hotels:", error);
      return [];
    }
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    try {
      console.log("Storage createHotel called with data:", hotel);
      console.log("Hotel data keys:", Object.keys(hotel));
      console.log("=== STORAGE FEATURES DEBUG ===");
      console.log("Input hotel.features:", hotel.features);
      console.log("Input features type:", typeof hotel.features);
      console.log("Input features is array:", Array.isArray(hotel.features));
      if (Array.isArray(hotel.features)) {
        console.log("Input features length:", hotel.features.length);
        hotel.features.forEach((feature, index) => {
          console.log(`Input feature ${index}:`, JSON.stringify(feature));
        });
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

      console.log("Processed hotel data for insertion:", processedHotel);
      console.log("=== PROCESSED FEATURES DEBUG ===");
      console.log("Processed hotel.features:", processedHotel.features);
      console.log("Processed features type:", typeof processedHotel.features);
      console.log("Processed features is array:", Array.isArray(processedHotel.features));
      if (Array.isArray(processedHotel.features)) {
        console.log("Processed features length:", processedHotel.features.length);
        processedHotel.features.forEach((feature, index) => {
          console.log(`Processed feature ${index}:`, JSON.stringify(feature));
        });
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
    const [created] = await db.insert(tours).values(tour).returning();
    return created;
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

  // Menus
  async getMenuByLocation(location: string): Promise<Menu | undefined> {
    try {
      const [menu] = await db
        .select()
        .from(menus)
        .where(eq(menus.location, location));
      return menu || undefined;
    } catch (error) {
      console.error("Error getting menu by location:", error);
      return undefined;
    }
  }

  async listMenus(): Promise<Menu[]> {
    try {
      return await db.select().from(menus).orderBy(asc(menus.name));
    } catch (error) {
      console.error("Error listing menus:", error);
      return [];
    }
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [created] = await db.insert(menus).values(menu).returning();
    return created;
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

  // Menu Items
  async listMenuItems(menuId?: number): Promise<any[]> {
    try {
      const client = await pool.connect();
      let result;
      if (menuId !== undefined) {
        result = await client.query(
          'SELECT * FROM menu_items WHERE menu_id = $1 ORDER BY "order"',
          [menuId],
        );
      } else {
        result = await client.query(
          'SELECT * FROM menu_items ORDER BY "order"',
        );
      }
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
      const result = await client.query(
        'INSERT INTO menu_items (menu_id, title, url, icon, "order", active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          item.menuId,
          item.title,
          item.url || null,
          item.icon || null,
          item.order || 0,
          item.active !== false,
        ],
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating menu item:", error);
      throw error;
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
  async listTranslations(language?: string): Promise<any[]> {
    try {
      const client = await pool.connect();
      let result;
      if (language !== undefined) {
        result = await client.query(
          'SELECT * FROM translations WHERE language = $1 ORDER BY "key"',
          [language],
        );
      } else {
        result = await client.query(
          'SELECT * FROM translations ORDER BY "key"',
        );
      }
      client.release();
      return result.rows || [];
    } catch (error) {
      console.error("Error listing translations:", error);
      return [];
    }
  }

  async createTranslation(translation: any): Promise<any> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'INSERT INTO translations ("key", language, value, en_text, ar_text, context, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          translation.key,
          translation.language || "en",
          translation.value,
          translation.enText || translation.value,
          translation.arText,
          translation.context,
          translation.category,
        ],
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating translation:", error);
      throw error;
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
      let query = db.select().from(hotelCategories);
      if (active !== undefined) {
        query = query.where(eq(hotelCategories.active, active));
      }
      return await query.orderBy(hotelCategories.name);
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
}

export const storage = new DatabaseStorage();

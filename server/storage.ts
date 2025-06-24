import { 
  users, User, InsertUser,
  countries, Country, InsertCountry,
  cities, City, InsertCity,
  destinations, Destination, InsertDestination,
  packages, Package, InsertPackage,
  tours, Tour, InsertTour,
  hotels, Hotel, InsertHotel,
  heroSlides, HeroSlide, InsertHeroSlide,
  menus, Menu, InsertMenu,
  packageCategories, PackageCategory, InsertPackageCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;

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
  updatePackage(id: number, pkg: Partial<InsertPackage>): Promise<Package | undefined>;

  // Hotels
  getHotel(id: number): Promise<Hotel | undefined>;
  listHotels(active?: boolean): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;

  // Tours
  getTour(id: number): Promise<Tour | undefined>;
  listTours(active?: boolean): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>;

  // Hero Slides
  getActiveHeroSlides(): Promise<HeroSlide[]>;
  createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide>;

  // Menus
  getMenuByLocation(location: string): Promise<Menu | undefined>;
  listMenus(): Promise<Menu[]>;
  createMenu(menu: InsertMenu): Promise<Menu>;

  // Package Categories
  listPackageCategories(active?: boolean): Promise<PackageCategory[]>;
  createPackageCategory(category: InsertPackageCategory): Promise<PackageCategory>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set({
      ...user,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async listUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(asc(users.id));
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }

  // Countries
  async getCountry(id: number): Promise<Country | undefined> {
    try {
      const [country] = await db.select().from(countries).where(eq(countries.id, id));
      return country || undefined;
    } catch (error) {
      console.error('Error getting country:', error);
      return undefined;
    }
  }

  async listCountries(active?: boolean): Promise<Country[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(countries).where(eq(countries.active, active)).orderBy(asc(countries.name));
      }
      return await db.select().from(countries).orderBy(asc(countries.name));
    } catch (error) {
      console.error('Error listing countries:', error);
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
      console.error('Error getting city:', error);
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
        return await db.select().from(cities).where(and(...conditions)).orderBy(asc(cities.name));
      }
      return await db.select().from(cities).orderBy(asc(cities.name));
    } catch (error) {
      console.error('Error listing cities:', error);
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
      const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
      return destination || undefined;
    } catch (error) {
      console.error('Error getting destination:', error);
      return undefined;
    }
  }

  async listDestinations(active?: boolean): Promise<Destination[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(destinations).where(eq(destinations.featured, active)).orderBy(desc(destinations.createdAt));
      }
      return await db.select().from(destinations).orderBy(desc(destinations.createdAt));
    } catch (error) {
      console.error('Error listing destinations:', error);
      return [];
    }
  }

  async createDestination(destination: InsertDestination): Promise<Destination> {
    const [created] = await db.insert(destinations).values(destination).returning();
    return created;
  }

  // Packages
  async getPackage(id: number): Promise<Package | undefined> {
    try {
      const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
      return pkg || undefined;
    } catch (error) {
      console.error('Error getting package:', error);
      return undefined;
    }
  }

  async listPackages(active?: boolean): Promise<Package[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(packages).where(eq(packages.featured, active)).orderBy(desc(packages.createdAt));
      }
      return await db.select().from(packages).orderBy(desc(packages.createdAt));
    } catch (error) {
      console.error('Error listing packages:', error);
      return [];
    }
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [created] = await db.insert(packages).values(pkg).returning();
    return created;
  }

  async updatePackage(id: number, pkg: Partial<InsertPackage>): Promise<Package | undefined> {
    const [updated] = await db.update(packages).set({
      ...pkg,
      updatedAt: new Date()
    }).where(eq(packages.id, id)).returning();
    return updated || undefined;
  }

  // Hotels
  async getHotel(id: number): Promise<Hotel | undefined> {
    try {
      const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
      return hotel || undefined;
    } catch (error) {
      console.error('Error getting hotel:', error);
      return undefined;
    }
  }

  async listHotels(active?: boolean): Promise<Hotel[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(hotels).where(eq(hotels.status, active ? 'active' : 'inactive')).orderBy(desc(hotels.createdAt));
      }
      return await db.select().from(hotels).orderBy(desc(hotels.createdAt));
    } catch (error) {
      console.error('Error listing hotels:', error);
      return [];
    }
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [created] = await db.insert(hotels).values(hotel).returning();
    return created;
  }

  // Tours
  async getTour(id: number): Promise<Tour | undefined> {
    try {
      const [tour] = await db.select().from(tours).where(eq(tours.id, id));
      return tour || undefined;
    } catch (error) {
      console.error('Error getting tour:', error);
      return undefined;
    }
  }

  async listTours(active?: boolean): Promise<Tour[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(tours).where(eq(tours.active, active)).orderBy(desc(tours.createdAt));
      }
      return await db.select().from(tours).orderBy(desc(tours.createdAt));
    } catch (error) {
      console.error('Error listing tours:', error);
      return [];
    }
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    const [created] = await db.insert(tours).values(tour).returning();
    return created;
  }

  // Hero Slides
  async getActiveHeroSlides(): Promise<HeroSlide[]> {
    try {
      console.log('Storage: Attempting to fetch hero slides...');
      const slides = await db.select().from(heroSlides).where(eq(heroSlides.active, true)).orderBy(asc(heroSlides.order));
      console.log('Storage: Successfully fetched hero slides:', slides.length);
      return slides;
    } catch (error) {
      console.error('Storage: Error getting active hero slides:', error);
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
      const [menu] = await db.select().from(menus).where(eq(menus.location, location));
      return menu || undefined;
    } catch (error) {
      console.error('Error getting menu by location:', error);
      return undefined;
    }
  }

  async listMenus(): Promise<Menu[]> {
    try {
      return await db.select().from(menus).orderBy(asc(menus.name));
    } catch (error) {
      console.error('Error listing menus:', error);
      return [];
    }
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [created] = await db.insert(menus).values(menu).returning();
    return created;
  }

  // Package Categories
  async listPackageCategories(active?: boolean): Promise<PackageCategory[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(packageCategories).where(eq(packageCategories.active, active)).orderBy(asc(packageCategories.name));
      }
      return await db.select().from(packageCategories).orderBy(asc(packageCategories.name));
    } catch (error) {
      console.error('Error listing package categories:', error);
      return [];
    }
  }

  async createPackageCategory(category: InsertPackageCategory): Promise<PackageCategory> {
    const [created] = await db.insert(packageCategories).values(category).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
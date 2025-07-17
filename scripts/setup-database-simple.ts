import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : 
       DATABASE_URL.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
});

const db = drizzle(pool);

async function setupDatabase() {
  try {
    console.log("Setting up database...");
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log("Database connection successful!");
    
    // Drop existing tables if they exist (for clean setup)
    await db.execute(sql`DROP TABLE IF EXISTS bookings CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS tours CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hotels CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS packages CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS destinations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS cities CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS countries CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS package_categories CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS tour_categories CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hotel_categories CASCADE`);
    
    console.log("Creating tables...");
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create countries table
    await db.execute(sql`
      CREATE TABLE countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(3) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create cities table
    await db.execute(sql`
      CREATE TABLE cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create destinations table
    await db.execute(sql`
      CREATE TABLE destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create package_categories table
    await db.execute(sql`
      CREATE TABLE package_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tour_categories table
    await db.execute(sql`
      CREATE TABLE tour_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create hotel_categories table
    await db.execute(sql`
      CREATE TABLE hotel_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create packages table
    await db.execute(sql`
      CREATE TABLE packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES package_categories(id) ON DELETE SET NULL,
        duration_days INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tours table
    await db.execute(sql`
      CREATE TABLE tours (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES tour_categories(id) ON DELETE SET NULL,
        duration_hours INTEGER,
        destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create hotels table
    await db.execute(sql`
      CREATE TABLE hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT,
        city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES hotel_categories(id) ON DELETE SET NULL,
        price_per_night DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create bookings table
    await db.execute(sql`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
        tour_id INTEGER REFERENCES tours(id) ON DELETE SET NULL,
        hotel_id INTEGER REFERENCES hotels(id) ON DELETE SET NULL,
        booking_date DATE NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Tables created successfully!");
    
    // Insert admin user
    await db.execute(sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@saharajourneys.com', 'admin123', 'admin')
    `);
    
    // Insert countries
    await db.execute(sql`
      INSERT INTO countries (name, code)
      VALUES 
        ('Egypt', 'EG'),
        ('Jordan', 'JO'),
        ('UAE', 'AE')
    `);
    
    // Insert cities
    await db.execute(sql`
      INSERT INTO cities (name, country_id)
      SELECT 'Cairo', id FROM countries WHERE code = 'EG'
    `);
    
    await db.execute(sql`
      INSERT INTO cities (name, country_id)
      SELECT 'Luxor', id FROM countries WHERE code = 'EG'
    `);
    
    await db.execute(sql`
      INSERT INTO cities (name, country_id)
      SELECT 'Amman', id FROM countries WHERE code = 'JO'
    `);
    
    await db.execute(sql`
      INSERT INTO cities (name, country_id)
      SELECT 'Dubai', id FROM countries WHERE code = 'AE'
    `);
    
    // Insert destinations
    await db.execute(sql`
      INSERT INTO destinations (name, description, city_id)
      SELECT 'Pyramids of Giza', 'Ancient Egyptian pyramids', id FROM cities WHERE name = 'Cairo'
    `);
    
    await db.execute(sql`
      INSERT INTO destinations (name, description, city_id)
      SELECT 'Valley of Kings', 'Ancient Egyptian tombs', id FROM cities WHERE name = 'Luxor'
    `);
    
    await db.execute(sql`
      INSERT INTO destinations (name, description, city_id)
      SELECT 'Petra', 'Ancient city carved in rock', id FROM cities WHERE name = 'Amman'
    `);
    
    await db.execute(sql`
      INSERT INTO destinations (name, description, city_id)
      SELECT 'Burj Khalifa', 'World tallest building', id FROM cities WHERE name = 'Dubai'
    `);
    
    // Insert categories
    await db.execute(sql`
      INSERT INTO package_categories (name, description)
      VALUES 
        ('Cultural Tours', 'Explore ancient history and culture'),
        ('Adventure Tours', 'Exciting outdoor activities'),
        ('Luxury Tours', 'Premium travel experiences')
    `);
    
    await db.execute(sql`
      INSERT INTO tour_categories (name, description)
      VALUES 
        ('Historical Tours', 'Visit historical sites and monuments'),
        ('City Tours', 'Explore urban attractions'),
        ('Desert Tours', 'Experience desert landscapes')
    `);
    
    await db.execute(sql`
      INSERT INTO hotel_categories (name, description)
      VALUES 
        ('5-Star Hotels', 'Luxury accommodations'),
        ('4-Star Hotels', 'Premium hotels'),
        ('3-Star Hotels', 'Comfortable stays')
    `);
    
    console.log("Sample data inserted successfully!");
    console.log("Database setup complete!");
    
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
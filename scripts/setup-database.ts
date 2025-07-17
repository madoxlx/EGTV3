import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool, { schema });

async function setupDatabase() {
  try {
    console.log("Setting up database...");
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log("Database connection successful!");
    
    // Create tables in the correct order
    console.log("Creating tables...");
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
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
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(3) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create cities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country_id INTEGER REFERENCES countries(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create destinations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        city_id INTEGER REFERENCES cities(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create package_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS package_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create packages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES package_categories(id),
        duration_days INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tour_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tours table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES tour_categories(id),
        duration_hours INTEGER,
        destination_id INTEGER REFERENCES destinations(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create hotel_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create hotels table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT,
        city_id INTEGER REFERENCES cities(id),
        category_id INTEGER REFERENCES hotel_categories(id),
        price_per_night DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create bookings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        package_id INTEGER REFERENCES packages(id),
        tour_id INTEGER REFERENCES tours(id),
        hotel_id INTEGER REFERENCES hotels(id),
        booking_date DATE NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Database setup complete!");
    
    // Insert admin user
    await db.execute(sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@saharajourneys.com', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING
    `);
    
    // Insert sample data
    await db.execute(sql`
      INSERT INTO countries (name, code)
      VALUES 
        ('Egypt', 'EG'),
        ('Jordan', 'JO'),
        ('UAE', 'AE')
      ON CONFLICT (code) DO NOTHING
    `);
    
    await db.execute(sql`
      INSERT INTO cities (name, country_id)
      VALUES 
        ('Cairo', (SELECT id FROM countries WHERE code = 'EG')),
        ('Luxor', (SELECT id FROM countries WHERE code = 'EG')),
        ('Amman', (SELECT id FROM countries WHERE code = 'JO')),
        ('Dubai', (SELECT id FROM countries WHERE code = 'AE'))
    `);
    
    await db.execute(sql`
      INSERT INTO destinations (name, description, city_id)
      VALUES 
        ('Pyramids of Giza', 'Ancient Egyptian pyramids', (SELECT id FROM cities WHERE name = 'Cairo')),
        ('Valley of Kings', 'Ancient Egyptian tombs', (SELECT id FROM cities WHERE name = 'Luxor')),
        ('Petra', 'Ancient city carved in rock', (SELECT id FROM cities WHERE name = 'Amman')),
        ('Burj Khalifa', 'World tallest building', (SELECT id FROM cities WHERE name = 'Dubai'))
    `);
    
    console.log("Sample data inserted!");
    
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
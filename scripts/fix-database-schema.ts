
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

async function fixDatabaseSchema() {
  try {
    console.log("🔧 Fixing database schema...");
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful!");
    
    // Add missing columns to existing tables
    console.log("📝 Adding missing columns...");
    
    // Fix menus table - add description column
    try {
      await db.execute(sql`ALTER TABLE menus ADD COLUMN IF NOT EXISTS description TEXT`);
      console.log("✅ Added description column to menus");
    } catch (error) {
      console.log("⚠️ Description column already exists in menus or error:", (error as Error).message);
    }
    
    // Fix packages table - add missing columns
    try {
      await db.execute(sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS overview TEXT`);
      await db.execute(sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS accommodation_highlights JSONB DEFAULT '[]'`);
      await db.execute(sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation_details JSONB DEFAULT '[]'`);
      await db.execute(sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS ideal_for JSONB DEFAULT '[]'`);
      console.log("✅ Added missing columns to packages");
    } catch (error) {
      console.log("⚠️ Package columns issue:", (error as Error).message);
    }
    
    // Fix destinations table - add country column
    try {
      await db.execute(sql`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS country TEXT`);
      console.log("✅ Added country column to destinations");
    } catch (error) {
      console.log("⚠️ Country column already exists in destinations or error:", (error as Error).message);
    }
    
    // Fix cities table - add description column
    try {
      await db.execute(sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS description TEXT`);
      console.log("✅ Added description column to cities");
    } catch (error) {
      console.log("⚠️ Description column already exists in cities or error:", (error as Error).message);
    }
    
    // Create missing tables
    console.log("🏗️ Creating missing tables...");
    
    // Create translations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL,
        en_text TEXT NOT NULL,
        ar_text TEXT,
        context TEXT,
        category TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(key, category)
      )
    `);
    
    // Create tour_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create homepage_sections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT,
        button_text TEXT,
        button_link TEXT,
        secondary_button_text TEXT,
        secondary_button_link TEXT,
        tourists_count TEXT DEFAULT '5000+',
        destinations_count TEXT DEFAULT '300+',
        hotels_count TEXT DEFAULT '200+',
        show_statistics BOOLEAN DEFAULT FALSE,
        featured_item1_title TEXT,
        featured_item1_description TEXT,
        featured_item1_icon TEXT,
        featured_item2_title TEXT,
        featured_item2_description TEXT,
        featured_item2_icon TEXT,
        background_color TEXT DEFAULT '#ffffff',
        text_color TEXT DEFAULT '#000000',
        image_position TEXT DEFAULT 'left',
        order_position INTEGER DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create site_language_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_language_settings (
        id SERIAL PRIMARY KEY,
        default_language TEXT DEFAULT 'en',
        available_languages JSONB DEFAULT '["en", "ar"]',
        rtl_languages JSONB DEFAULT '["ar"]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create hero_slides table if missing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        button_text TEXT,
        button_link TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("✅ All missing tables created successfully!");
    
    // Insert default data
    console.log("📊 Inserting default data...");
    
    // Insert default site language settings
    await db.execute(sql`
      INSERT INTO site_language_settings (default_language, available_languages, rtl_languages)
      VALUES ('en', '["en", "ar"]', '["ar"]')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert basic tour categories
    await db.execute(sql`
      INSERT INTO tour_categories (name, description, active)
      VALUES 
        ('Historical Tours', 'Visit historical sites and monuments', TRUE),
        ('City Tours', 'Explore urban attractions', TRUE),
        ('Desert Tours', 'Experience desert landscapes', TRUE),
        ('Cultural Tours', 'Explore ancient history and culture', TRUE),
        ('Adventure Tours', 'Exciting outdoor activities', TRUE)
      ON CONFLICT DO NOTHING
    `);
    
    // Insert essential translations
    await db.execute(sql`
      INSERT INTO translations (key, en_text, ar_text, category)
      VALUES 
        ('common.home', 'Home', 'الرئيسية', 'common'),
        ('common.about', 'About', 'حول', 'common'),
        ('common.contact', 'Contact', 'اتصل بنا', 'common'),
        ('common.services', 'Services', 'الخدمات', 'common'),
        ('common.packages', 'Packages', 'الباقات', 'common'),
        ('common.tours', 'Tours', 'الجولات', 'common'),
        ('common.hotels', 'Hotels', 'الفنادق', 'common'),
        ('common.destinations', 'Destinations', 'الوجهات', 'common'),
        ('footer.all_rights_reserved', 'All rights reserved', 'جميع الحقوق محفوظة', 'footer'),
        ('header.menu', 'Menu', 'القائمة', 'header')
      ON CONFLICT (key, category) DO NOTHING
    `);
    
    console.log("✅ Default data inserted successfully!");
    console.log("🎉 Database schema fix completed!");
    
  } catch (error) {
    console.error("❌ Error fixing database schema:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema().catch(console.error);

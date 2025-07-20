#!/usr/bin/env tsx

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./shared/schema";

const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("🚀 إعداد قاعدة البيانات الخارجية...");
console.log("Database URL:", databaseUrl.replace(/:[^@]+@/, ":****@"));

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  connectionTimeoutMillis: 30000,
  max: 20,
});

const db = drizzle(pool, { schema });

async function setupDatabase() {
  try {
    console.log("✅ اختبار الاتصال...");
    await pool.query("SELECT 1");
    console.log("✅ الاتصال نجح!");

    // Check existing tables
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("📋 الجداول الموجودة:", existingTables.rows.map(r => r.table_name));

    // Create all tables
    console.log("🔨 إنشاء الجداول...");

    // Countries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول countries تم إنشاؤه");

    // Cities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country_id INTEGER NOT NULL REFERENCES countries(id),
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول cities تم إنشاؤه");

    // Airports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL REFERENCES cities(id),
        code TEXT,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول airports تم إنشاؤه");

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'user' NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        status TEXT DEFAULT 'active',
        nationality TEXT,
        date_of_birth TIMESTAMP,
        passport_number TEXT,
        passport_expiry TIMESTAMP,
        emergency_contact TEXT,
        emergency_phone TEXT,
        dietary_requirements TEXT,
        medical_conditions TEXT,
        preferred_language TEXT DEFAULT 'en',
        email_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        marketing_emails BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول users تم إنشاؤه");

    // Destinations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER REFERENCES cities(id),
        country_id INTEGER REFERENCES countries(id),
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول destinations تم إنشاؤه");

    // Package categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT DEFAULT '#3B82F6',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول package_categories تم إنشاؤه");

    // Packages table with all required columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        slug TEXT,
        description TEXT,
        short_description TEXT,
        overview TEXT,
        price DOUBLE PRECISION NOT NULL DEFAULT 0,
        original_price DOUBLE PRECISION,
        currency TEXT DEFAULT 'USD',
        duration INTEGER DEFAULT 1,
        duration_type TEXT DEFAULT 'days',
        max_participants INTEGER DEFAULT 10,
        min_age INTEGER DEFAULT 0,
        max_age INTEGER DEFAULT 100,
        difficulty_level TEXT DEFAULT 'easy',
        country_id INTEGER REFERENCES countries(id),
        city_id INTEGER REFERENCES cities(id),
        category_id INTEGER REFERENCES package_categories(id),
        destination_id INTEGER REFERENCES destinations(id),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        valid_until TIMESTAMP,
        booking_deadline TIMESTAMP,
        featured BOOLEAN DEFAULT false,
        popular BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        availability_status TEXT DEFAULT 'available',
        main_image_url TEXT,
        gallery_urls JSONB DEFAULT '[]',
        included_features JSONB DEFAULT '[]',
        excluded_features JSONB DEFAULT '[]',
        itinerary JSONB DEFAULT '[]',
        highlights JSONB DEFAULT '[]',
        what_to_expect JSONB DEFAULT '[]',
        additional_info JSONB DEFAULT '[]',
        cancellation_policy TEXT,
        terms_and_conditions TEXT,
        special_instructions TEXT,
        meeting_point TEXT,
        pickup_locations JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        seo_title TEXT,
        seo_description TEXT,
        seo_keywords TEXT,
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        booking_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        wishlist_count INTEGER DEFAULT 0,
        type TEXT DEFAULT 'package',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول packages تم إنشاؤه");

    // Tours categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT DEFAULT '#10B981',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول tour_categories تم إنشاؤه");

    // Tours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        slug TEXT,
        description TEXT,
        short_description TEXT,
        overview TEXT,
        price DOUBLE PRECISION NOT NULL DEFAULT 0,
        original_price DOUBLE PRECISION,
        currency TEXT DEFAULT 'USD',
        duration INTEGER DEFAULT 1,
        duration_type TEXT DEFAULT 'hours',
        max_participants INTEGER DEFAULT 15,
        min_age INTEGER DEFAULT 0,
        max_age INTEGER DEFAULT 100,
        difficulty_level TEXT DEFAULT 'easy',
        country_id INTEGER REFERENCES countries(id),
        city_id INTEGER REFERENCES cities(id),
        category_id INTEGER REFERENCES tour_categories(id),
        destination_id INTEGER REFERENCES destinations(id),
        start_time TEXT,
        end_time TEXT,
        availability JSONB DEFAULT '[]',
        featured BOOLEAN DEFAULT false,
        popular BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        main_image_url TEXT,
        gallery_urls JSONB DEFAULT '[]',
        included_features JSONB DEFAULT '[]',
        excluded_features JSONB DEFAULT '[]',
        highlights JSONB DEFAULT '[]',
        what_to_expect JSONB DEFAULT '[]',
        additional_info JSONB DEFAULT '[]',
        cancellation_policy TEXT,
        meeting_point TEXT,
        pickup_locations JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        booking_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        type TEXT DEFAULT 'tour',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول tours تم إنشاؤه");

    // Hotels categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotel_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT DEFAULT '#F59E0B',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول hotel_categories تم إنشاؤه");

    // Hotels table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        slug TEXT,
        description TEXT,
        short_description TEXT,
        overview TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        postal_code TEXT,
        longitude DOUBLE PRECISION,
        latitude DOUBLE PRECISION,
        phone_number TEXT,
        email TEXT,
        website_url TEXT,
        star_rating INTEGER DEFAULT 3,
        category_id INTEGER REFERENCES hotel_categories(id),
        country_id INTEGER REFERENCES countries(id),
        city_id INTEGER REFERENCES cities(id),
        featured BOOLEAN DEFAULT false,
        popular BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        main_image_url TEXT,
        gallery_urls JSONB DEFAULT '[]',
        amenities JSONB DEFAULT '[]',
        facilities JSONB DEFAULT '[]',
        services JSONB DEFAULT '[]',
        room_types JSONB DEFAULT '[]',
        restaurants JSONB DEFAULT '[]',
        policies JSONB DEFAULT '{}',
        check_in_time TEXT DEFAULT '14:00',
        check_out_time TEXT DEFAULT '12:00',
        cancellation_policy TEXT,
        child_policy TEXT,
        pet_policy TEXT,
        smoking_policy TEXT DEFAULT 'non-smoking',
        tags JSONB DEFAULT '[]',
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        booking_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        type TEXT DEFAULT 'hotel',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول hotels تم إنشاؤه");

    // Translations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        category TEXT DEFAULT 'general',
        en_text TEXT,
        ar_text TEXT,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول translations تم إنشاؤه");

    // Site language settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_language_settings (
        id SERIAL PRIMARY KEY,
        default_language TEXT DEFAULT 'en' NOT NULL,
        available_languages JSONB DEFAULT '["en", "ar"]',
        rtl_languages JSONB DEFAULT '["ar"]',
        auto_detect_language BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ جدول site_language_settings تم إنشاؤه");

    // Insert default admin user
    console.log("👤 إضافة مستخدم الإدارة الافتراضي...");
    await pool.query(`
      INSERT INTO users (username, password, email, role, display_name, first_name, last_name)
      VALUES ('admin', '$2a$10$rQJ4lWrKhiHy1KOPTy5oquxOhzY2.LfVGF0rLbZHlkODlXgJD4v9C', 'admin@saharajourneys.com', 'admin', 'Administrator', 'Admin', 'User')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log("✅ مستخدم الإدارة تم إنشاؤه (اسم المستخدم: admin، كلمة المرور: admin123)");

    // Insert default language settings
    await pool.query(`
      INSERT INTO site_language_settings (default_language, available_languages, rtl_languages)
      VALUES ('en', '["en", "ar"]', '["ar"]')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ إعدادات اللغة تم إدراجها");

    // Insert basic sample data
    await pool.query(`
      INSERT INTO countries (name, code, description) VALUES
      ('Egypt', 'EG', 'The land of pharaohs and ancient wonders'),
      ('Jordan', 'JO', 'The Hashemite Kingdom with ancient Petra'),
      ('UAE', 'AE', 'Modern cities and desert adventures')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO package_categories (name, description, icon) VALUES
      ('Cultural Tours', 'Explore ancient civilizations and heritage', 'building'),
      ('Adventure Travel', 'Thrilling outdoor experiences', 'mountain'),
      ('Luxury Travel', 'Premium comfort and exclusive experiences', 'crown'),
      ('Family Packages', 'Fun for the whole family', 'users'),
      ('Desert Safari', 'Explore vast desert landscapes', 'sun')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO tour_categories (name, description, icon) VALUES
      ('Historical Tours', 'Visit ancient monuments and sites', 'history'),
      ('City Tours', 'Explore modern urban landscapes', 'building'),
      ('Nature Tours', 'Connect with natural beauty', 'tree'),
      ('Food Tours', 'Taste authentic local cuisine', 'utensils'),
      ('Adventure Tours', 'Exciting outdoor activities', 'zap')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO hotel_categories (name, description, icon) VALUES
      ('Luxury Hotels', 'Premium 5-star accommodations', 'crown'),
      ('Business Hotels', 'Perfect for business travelers', 'briefcase'),
      ('Resort Hotels', 'Vacation and leisure destinations', 'sun'),
      ('Boutique Hotels', 'Unique and intimate experiences', 'heart'),
      ('Budget Hotels', 'Affordable comfortable stays', 'dollar-sign')
      ON CONFLICT DO NOTHING;
    `);

    console.log("✅ البيانات الأساسية تم إدراجها");

    // Final verification
    const finalTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("🎉 إعداد قاعدة البيانات مكتمل!");
    console.log("📋 إجمالي الجداول المُنشأة:", finalTables.rows.length);
    console.log("📋 الجداول:", finalTables.rows.map(r => r.table_name).join(", "));

  } catch (error) {
    console.error("❌ خطأ في إعداد قاعدة البيانات:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);
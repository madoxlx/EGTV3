const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function setupDatabase() {
  console.log('🔧 Setting up database schema...');
  
  try {
    // Create countries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER
      )
    `);
    
    // Create cities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country_id INTEGER NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (country_id) REFERENCES countries(id)
      )
    `);
    
    // Create airports table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL,
        code TEXT,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (city_id) REFERENCES cities(id)
      )
    `);
    
    // Create users table
    await db.execute(sql`
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
      )
    `);
    
    // Create destinations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        country_id INTEGER,
        city_id INTEGER,
        description TEXT,
        image_url TEXT,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id)
      )
    `);
    
    // Create tours table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        destination_id INTEGER,
        duration INTEGER NOT NULL,
        price INTEGER NOT NULL,
        max_capacity INTEGER,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (destination_id) REFERENCES destinations(id)
      )
    `);
    
    // Create hotels table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        city_id INTEGER,
        country_id INTEGER,
        rating INTEGER,
        price_per_night INTEGER,
        amenities JSON,
        image_url TEXT,
        gallery_urls JSON,
        phone TEXT,
        email TEXT,
        website TEXT,
        active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (country_id) REFERENCES countries(id)
      )
    `);
    
    // Create packages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        overview TEXT,
        price INTEGER NOT NULL,
        discounted_price INTEGER,
        currency TEXT DEFAULT 'EGP' NOT NULL,
        image_url TEXT,
        gallery_urls JSON,
        duration INTEGER NOT NULL,
        duration_type TEXT DEFAULT 'days' NOT NULL,
        rating INTEGER,
        review_count INTEGER DEFAULT 0,
        destination_id INTEGER,
        country_id INTEGER,
        city_id INTEGER,
        category_id INTEGER,
        category TEXT,
        featured BOOLEAN DEFAULT false,
        type TEXT,
        inclusions JSON,
        slug TEXT UNIQUE,
        route TEXT,
        ideal_for JSON,
        tour_selection JSON,
        selected_tour_id INTEGER,
        included_features JSON,
        optional_excursions JSON,
        excluded_features JSON,
        itinerary JSON,
        what_to_pack JSON,
        travel_route JSON,
        accommodation_highlights JSON,
        transportation_details JSON,
        transportation TEXT,
        transportation_price INTEGER,
        pricing_mode TEXT DEFAULT 'per_booking',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        valid_until TIMESTAMP,
        adult_count INTEGER DEFAULT 2,
        children_count INTEGER DEFAULT 0,
        infant_count INTEGER DEFAULT 0,
        max_group_size INTEGER DEFAULT 15,
        language TEXT DEFAULT 'english',
        best_time_to_visit TEXT,
        selected_hotels JSON,
        rooms JSON,
        cancellation_policy TEXT,
        children_policy TEXT,
        terms_and_conditions TEXT,
        excluded_items JSON,
        custom_text TEXT,
        markup INTEGER,
        markup_type TEXT,
        discount_type TEXT,
        discount_value INTEGER,
        has_arabic_version BOOLEAN DEFAULT false,
        title_ar TEXT,
        description_ar TEXT,
        short_description_ar TEXT,
        overview_ar TEXT,
        best_time_to_visit_ar TEXT,
        cancellation_policy_ar TEXT,
        children_policy_ar TEXT,
        terms_and_conditions_ar TEXT,
        custom_text_ar TEXT,
        included_features_ar JSON,
        excluded_features_ar JSON,
        ideal_for_ar JSON,
        itinerary_ar JSON,
        what_to_pack_ar JSON,
        travel_route_ar JSON,
        optional_excursions_ar JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (destination_id) REFERENCES destinations(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (city_id) REFERENCES cities(id),
        FOREIGN KEY (selected_tour_id) REFERENCES tours(id)
      )
    `);
    
    // Create bookings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_reference TEXT NOT NULL UNIQUE,
        user_id INTEGER,
        package_id INTEGER,
        tour_id INTEGER,
        hotel_id INTEGER,
        booking_date TIMESTAMP NOT NULL DEFAULT NOW(),
        travel_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP,
        number_of_travelers INTEGER NOT NULL,
        adult_count INTEGER NOT NULL,
        child_count INTEGER DEFAULT 0,
        infant_count INTEGER DEFAULT 0,
        total_price INTEGER NOT NULL,
        base_price INTEGER NOT NULL,
        tax_amount INTEGER DEFAULT 0,
        discount_amount INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'EGP' NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        payment_status TEXT DEFAULT 'pending' NOT NULL,
        payment_method TEXT,
        payment_reference TEXT,
        special_requests TEXT,
        notes TEXT,
        confirmed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (package_id) REFERENCES packages(id),
        FOREIGN KEY (tour_id) REFERENCES tours(id),
        FOREIGN KEY (hotel_id) REFERENCES hotels(id)
      )
    `);
    
    // Create hero_slides table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        button_text TEXT,
        button_link TEXT,
        secondary_button_text TEXT,
        secondary_button_link TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER
      )
    `);
    
    // Create homepage_sections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        button_text TEXT,
        button_link TEXT,
        tourists_count TEXT DEFAULT '5000+',
        destinations_count TEXT DEFAULT '300+',
        hotels_count TEXT DEFAULT '150+',
        tourists_label TEXT DEFAULT 'Tourists',
        destinations_label TEXT DEFAULT 'Destinations',
        hotels_label TEXT DEFAULT 'Hotels',
        tourists_label_ar TEXT DEFAULT 'السياح',
        destinations_label_ar TEXT DEFAULT 'الوجهات',
        hotels_label_ar TEXT DEFAULT 'الفنادق',
        feature1_title TEXT DEFAULT 'Flexible Booking',
        feature1_description TEXT DEFAULT 'Free cancellation options available',
        feature1_icon TEXT DEFAULT 'calendar',
        feature2_title TEXT DEFAULT 'Expert Guides',
        feature2_description TEXT DEFAULT 'Local, knowledgeable tour guides',
        feature2_icon TEXT DEFAULT 'user-check',
        features JSONB DEFAULT '[]',
        title_ar TEXT,
        subtitle_ar TEXT,
        description_ar TEXT,
        button_text_ar TEXT,
        feature1_title_ar TEXT,
        feature1_description_ar TEXT,
        feature2_title_ar TEXT,
        feature2_description_ar TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        show_statistics BOOLEAN DEFAULT true,
        show_features BOOLEAN DEFAULT true,
        image_position TEXT DEFAULT 'left',
        background_color TEXT DEFAULT 'white',
        text_color TEXT DEFAULT 'black',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER
      )
    `);
    
    // Create menus table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create menu_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER NOT NULL,
        parent_id INTEGER,
        title TEXT NOT NULL,
        url TEXT,
        icon TEXT,
        type TEXT DEFAULT 'link',
        target TEXT DEFAULT '_self',
        order_position INTEGER,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
      )
    `);
    
    // Create translations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        en_text TEXT NOT NULL,
        ar_text TEXT,
        context TEXT,
        category TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create site_language_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_language_settings (
        id SERIAL PRIMARY KEY,
        default_language TEXT DEFAULT 'en' NOT NULL,
        available_languages JSONB DEFAULT '["en", "ar"]',
        rtl_languages JSONB DEFAULT '["ar"]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create nationalities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS nationalities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create visas table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS visas (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        target_country_id INTEGER NOT NULL,
        image_url TEXT,
        price INTEGER,
        currency TEXT DEFAULT 'EGP' NOT NULL,
        processing_time TEXT,
        required_documents JSONB,
        validity_period TEXT,
        entry_type TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (target_country_id) REFERENCES countries(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create nationality_visa_requirements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS nationality_visa_requirements (
        id SERIAL PRIMARY KEY,
        visa_id INTEGER NOT NULL,
        nationality_id INTEGER NOT NULL,
        requirement_details TEXT,
        additional_documents JSONB,
        fees INTEGER,
        processing_time TEXT,
        notes TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (visa_id) REFERENCES visas(id) ON DELETE CASCADE,
        FOREIGN KEY (nationality_id) REFERENCES nationalities(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create package_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS package_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create tour_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create hotel_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create hotel_facilities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_facilities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create hotel_highlights table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_highlights (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create cleanliness_features table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cleanliness_features (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create transport_types table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transport_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create rooms table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        hotel_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        max_occupancy INTEGER NOT NULL,
        max_adults INTEGER NOT NULL,
        max_children INTEGER NOT NULL DEFAULT 0,
        max_infants INTEGER NOT NULL DEFAULT 0,
        price INTEGER NOT NULL,
        discounted_price INTEGER,
        currency TEXT DEFAULT 'EGP' NOT NULL,
        image_url TEXT,
        size TEXT,
        bed_type TEXT,
        amenities JSONB,
        view TEXT,
        available BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create why_choose_us_sections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS why_choose_us_sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create foreign key constraints for users table
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_countries_created_by') THEN
          ALTER TABLE countries ADD CONSTRAINT fk_countries_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_countries_updated_by') THEN
          ALTER TABLE countries ADD CONSTRAINT fk_countries_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_cities_created_by') THEN
          ALTER TABLE cities ADD CONSTRAINT fk_cities_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_cities_updated_by') THEN
          ALTER TABLE cities ADD CONSTRAINT fk_cities_updated_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_airports_created_by') THEN
          ALTER TABLE airports ADD CONSTRAINT fk_airports_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_airports_updated_by') THEN
          ALTER TABLE airports ADD CONSTRAINT fk_airports_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_destinations_created_by') THEN
          ALTER TABLE destinations ADD CONSTRAINT fk_destinations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_destinations_updated_by') THEN
          ALTER TABLE destinations ADD CONSTRAINT fk_destinations_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_hero_slides_created_by') THEN
          ALTER TABLE hero_slides ADD CONSTRAINT fk_hero_slides_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_hero_slides_updated_by') THEN
          ALTER TABLE hero_slides ADD CONSTRAINT fk_hero_slides_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_homepage_sections_created_by') THEN
          ALTER TABLE homepage_sections ADD CONSTRAINT fk_homepage_sections_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_homepage_sections_updated_by') THEN
          ALTER TABLE homepage_sections ADD CONSTRAINT fk_homepage_sections_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    
    console.log('✅ Database schema created successfully');
    
    // Create sample data
    await createSampleData();
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function createSampleData() {
  console.log('📊 Creating sample data...');
  
  try {
    // Check if admin user exists, if not create one
    const existingAdmin = await db.execute(sql`SELECT id FROM users WHERE username = 'admin'`);
    if (existingAdmin.rows.length === 0) {
      await db.execute(sql`
        INSERT INTO users (username, email, password, full_name, role, bio)
        VALUES ('admin', 'admin@saharajourneys.com', 'admin123.salt', 'System Administrator', 'admin', 'System administrator for Sahara Journeys')
      `);
    }
    
    // Create sample countries (check if they exist first)
    const countries = [
      { name: 'Egypt', code: 'EG', description: 'Land of the Pharaohs', image_url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d2db36?w=500' },
      { name: 'Morocco', code: 'MA', description: 'Kingdom of Morocco', image_url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d6?w=500' },
      { name: 'Jordan', code: 'JO', description: 'Hashemite Kingdom of Jordan', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' },
      { name: 'UAE', code: 'AE', description: 'United Arab Emirates', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500' }
    ];
    
    for (const country of countries) {
      const existing = await db.execute(sql`SELECT id FROM countries WHERE code = ${country.code}`);
      if (existing.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO countries (name, code, description, image_url, active) 
          VALUES (${country.name}, ${country.code}, ${country.description}, ${country.image_url}, true)
        `);
      }
    }
    
    // Create sample cities
    const cities = [
      { name: 'Cairo', country_id: 1, description: 'Capital of Egypt', image_url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d2db36?w=500' },
      { name: 'Luxor', country_id: 1, description: 'Ancient city of Thebes', image_url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=500' },
      { name: 'Marrakech', country_id: 2, description: 'Red City of Morocco', image_url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d6?w=500' },
      { name: 'Amman', country_id: 3, description: 'Capital of Jordan', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' },
      { name: 'Dubai', country_id: 4, description: 'Modern metropolis', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500' }
    ];
    
    for (const city of cities) {
      const existing = await db.execute(sql`SELECT id FROM cities WHERE name = ${city.name} AND country_id = ${city.country_id}`);
      if (existing.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO cities (name, country_id, description, image_url, active) 
          VALUES (${city.name}, ${city.country_id}, ${city.description}, ${city.image_url}, true)
        `);
      }
    }
    
    // Create essential categories
    const packageCategories = [
      { name: 'Adventure', description: 'Adventure travel packages' },
      { name: 'Cultural', description: 'Cultural experiences and heritage tours' },
      { name: 'Luxury', description: 'Premium luxury travel experiences' },
      { name: 'Family', description: 'Family-friendly travel packages' },
      { name: 'Business', description: 'Business travel and corporate packages' }
    ];
    
    for (const category of packageCategories) {
      const existing = await db.execute(sql`SELECT id FROM package_categories WHERE name = ${category.name}`);
      if (existing.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO package_categories (name, description, active) 
          VALUES (${category.name}, ${category.description}, true)
        `);
      }
    }
    
    const tourCategories = [
      { name: 'Cultural', description: 'Cultural tours and experiences' },
      { name: 'Adventure', description: 'Adventure and outdoor activities' },
      { name: 'Historical', description: 'Historical sites and monuments' },
      { name: 'Religious', description: 'Religious and spiritual tours' },
      { name: 'Nature', description: 'Nature and wildlife experiences' }
    ];
    
    for (const category of tourCategories) {
      const existing = await db.execute(sql`SELECT id FROM tour_categories WHERE name = ${category.name}`);
      if (existing.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO tour_categories (name, description, active) 
          VALUES (${category.name}, ${category.description}, true)
        `);
      }
    }
    
    const hotelCategories = [
      { name: 'Luxury', description: 'Luxury hotels and resorts' },
      { name: 'Business', description: 'Business hotels and conference facilities' },
      { name: 'Budget', description: 'Budget-friendly accommodations' },
      { name: 'Boutique', description: 'Boutique and unique hotels' },
      { name: 'Resort', description: 'Resort and leisure properties' }
    ];
    
    for (const category of hotelCategories) {
      const existing = await db.execute(sql`SELECT id FROM hotel_categories WHERE name = ${category.name}`);
      if (existing.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO hotel_categories (name, description, active) 
          VALUES (${category.name}, ${category.description}, true)
        `);
      }
    }
    
    // Create essential translations
    const translations = [
      { key: 'welcome', en_text: 'Welcome to Sahara Journeys', ar_text: 'مرحباً بكم في رحلات الصحراء', category: 'common' },
      { key: 'home', en_text: 'Home', ar_text: 'الرئيسية', category: 'navigation' },
      { key: 'packages', en_text: 'Packages', ar_text: 'الباقات', category: 'navigation' },
      { key: 'tours', en_text: 'Tours', ar_text: 'الجولات', category: 'navigation' },
      { key: 'hotels', en_text: 'Hotels', ar_text: 'الفنادق', category: 'navigation' },
      { key: 'destinations', en_text: 'Destinations', ar_text: 'الوجهات', category: 'navigation' },
      { key: 'contact', en_text: 'Contact', ar_text: 'اتصل بنا', category: 'navigation' },
      { key: 'about', en_text: 'About', ar_text: 'حول', category: 'navigation' },
      { key: 'book_now', en_text: 'Book Now', ar_text: 'احجز الآن', category: 'common' },
      { key: 'learn_more', en_text: 'Learn More', ar_text: 'اعرف المزيد', category: 'common' },
      { key: 'admin', en_text: 'Admin', ar_text: 'الإدارة', category: 'navigation' },
      { key: 'login', en_text: 'Login', ar_text: 'تسجيل الدخول', category: 'common' }
    ];
    
    for (const translation of translations) {
      const existing = await db.execute(sql`SELECT id FROM translations WHERE key = ${translation.key}`);
      if (existing.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO translations (key, en_text, ar_text, category) 
          VALUES (${translation.key}, ${translation.en_text}, ${translation.ar_text}, ${translation.category})
        `);
      }
    }
    
    // Create language settings
    const existingSettings = await db.execute(sql`SELECT id FROM site_language_settings WHERE default_language = 'en'`);
    if (existingSettings.rows.length === 0) {
      await db.execute(sql`
        INSERT INTO site_language_settings (default_language, available_languages, rtl_languages) 
        VALUES ('en', '["en", "ar"]', '["ar"]')
      `);
    }
    
    console.log('✅ Sample data created successfully');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run the setup
setupDatabase().catch(console.error);
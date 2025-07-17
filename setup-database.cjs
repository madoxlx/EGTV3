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
    
    // Create foreign key constraints for users table
    await db.execute(sql`
      ALTER TABLE countries ADD CONSTRAINT fk_countries_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE countries ADD CONSTRAINT fk_countries_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE cities ADD CONSTRAINT fk_cities_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE cities ADD CONSTRAINT fk_cities_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE airports ADD CONSTRAINT fk_airports_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE airports ADD CONSTRAINT fk_airports_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE destinations ADD CONSTRAINT fk_destinations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE destinations ADD CONSTRAINT fk_destinations_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE hero_slides ADD CONSTRAINT fk_hero_slides_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE hero_slides ADD CONSTRAINT fk_hero_slides_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE homepage_sections ADD CONSTRAINT fk_homepage_sections_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE homepage_sections ADD CONSTRAINT fk_homepage_sections_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
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
    // Create admin user
    await db.execute(sql`
      INSERT INTO users (username, email, password, full_name, role, bio)
      VALUES ('admin', 'admin@saharajourneys.com', 'admin123.salt', 'System Administrator', 'admin', 'System administrator for Sahara Journeys')
      ON CONFLICT (username) DO NOTHING
    `);
    
    // Create sample countries
    await db.execute(sql`
      INSERT INTO countries (name, code, description, image_url, active) VALUES
      ('Egypt', 'EG', 'Land of the Pharaohs', 'https://images.unsplash.com/photo-1539650116574-75c0c6d2db36?w=500', true),
      ('Morocco', 'MA', 'Kingdom of Morocco', 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d6?w=500', true),
      ('Jordan', 'JO', 'Hashemite Kingdom of Jordan', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', true),
      ('UAE', 'AE', 'United Arab Emirates', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500', true)
      ON CONFLICT (code) DO NOTHING
    `);
    
    // Create sample cities
    await db.execute(sql`
      INSERT INTO cities (name, country_id, description, image_url, active) VALUES
      ('Cairo', 1, 'Capital of Egypt', 'https://images.unsplash.com/photo-1539650116574-75c0c6d2db36?w=500', true),
      ('Luxor', 1, 'Ancient city of Thebes', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=500', true),
      ('Marrakech', 2, 'Red City of Morocco', 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d6?w=500', true),
      ('Amman', 3, 'Capital of Jordan', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', true),
      ('Dubai', 4, 'Modern metropolis', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500', true)
      ON CONFLICT DO NOTHING
    `);
    
    // Create sample destinations
    await db.execute(sql`
      INSERT INTO destinations (name, country, country_id, city_id, description, image_url, featured) VALUES
      ('Great Pyramids of Giza', 'Egypt', 1, 1, 'Ancient wonder of the world', 'https://images.unsplash.com/photo-1539650116574-75c0c6d2db36?w=500', true),
      ('Valley of the Kings', 'Egypt', 1, 2, 'Ancient pharaoh tombs', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=500', true),
      ('Jemaa el-Fnaa', 'Morocco', 2, 3, 'Famous square in Marrakech', 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d6?w=500', true),
      ('Burj Khalifa', 'UAE', 4, 5, 'World\'s tallest building', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500', true)
      ON CONFLICT DO NOTHING
    `);
    
    // Create sample hero slides
    await db.execute(sql`
      INSERT INTO hero_slides (title, subtitle, description, image_url, button_text, button_link, "order", active) VALUES
      ('Discover the Magic of the Middle East', 'Unforgettable Adventures Await', 'Experience the rich culture, stunning landscapes, and ancient wonders of the Middle East with our expertly crafted tour packages.', 'https://images.unsplash.com/photo-1539650116574-75c0c6d2db36?w=1200', 'Explore Packages', '/packages', 1, true),
      ('Ancient Wonders, Modern Comfort', 'Luxury Travel Experiences', 'Journey through time while enjoying world-class accommodations and personalized service throughout your adventure.', 'https://images.unsplash.com/photo-1489749798305-4fea3ae436d6?w=1200', 'View Tours', '/tours', 2, true)
      ON CONFLICT DO NOTHING
    `);
    
    // Create sample homepage section
    await db.execute(sql`
      INSERT INTO homepage_sections (title, subtitle, description, image_url, button_text, button_link, tourists_count, destinations_count, hotels_count, "order", active) VALUES
      ('Why Choose Sahara Journeys?', 'Your Gateway to Middle Eastern Adventures', 'We specialize in creating unforgettable travel experiences across the Middle East, combining ancient wonders with modern comfort and exceptional service.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 'Learn More', '/about', '5000+', '300+', '150+', 1, true)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Sample data created successfully');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run the setup
setupDatabase().catch(console.error);
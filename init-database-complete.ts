import { pool } from "./server/db";

async function initializeDatabase() {
  try {
    console.log("🏗️  Initializing complete database schema...");
    
    const client = await pool.connect();
    
    // Create core tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        password_hash TEXT,
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
    console.log("✅ Users table created");

    await client.query(`
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
    console.log("✅ Countries table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country_id INTEGER REFERENCES countries(id),
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Cities table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        country_id INTEGER REFERENCES countries(id),
        city_id INTEGER REFERENCES cities(id),
        description TEXT,
        image_url TEXT,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Destinations table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        currency TEXT DEFAULT 'EGP' NOT NULL,
        duration INTEGER NOT NULL,
        duration_type TEXT DEFAULT 'days' NOT NULL,
        destination_id INTEGER REFERENCES destinations(id),
        category_id INTEGER,
        featured BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id)
      );
    `);
    console.log("✅ Tours table created");

    // Create packages table with all necessary columns
    await client.query(`
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
        gallery_urls JSONB,
        duration INTEGER NOT NULL,
        duration_type TEXT DEFAULT 'days' NOT NULL,
        rating INTEGER,
        review_count INTEGER DEFAULT 0,
        destination_id INTEGER REFERENCES destinations(id),
        country_id INTEGER REFERENCES countries(id),
        city_id INTEGER REFERENCES cities(id),
        category_id INTEGER,
        category TEXT,
        featured BOOLEAN DEFAULT false,
        type TEXT,
        inclusions JSONB,
        slug TEXT UNIQUE,
        route TEXT,
        ideal_for JSONB,
        tour_selection JSONB,
        selected_tour_id INTEGER REFERENCES tours(id),
        included_features JSONB,
        optional_excursions JSONB,
        excluded_features JSONB,
        itinerary JSONB,
        what_to_pack JSONB,
        travel_route JSONB,
        accommodation_highlights JSONB,
        transportation_details JSONB,
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
        selected_hotels JSONB,
        rooms JSONB,
        cancellation_policy TEXT,
        children_policy TEXT,
        terms_and_conditions TEXT,
        excluded_items JSONB,
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
        included_features_ar JSONB,
        excluded_features_ar JSONB,
        ideal_for_ar JSONB,
        itinerary_ar JSONB,
        what_to_pack_ar JSONB,
        travel_route_ar JSONB,
        optional_excursions_ar JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id)
      );
    `);
    console.log("✅ Packages table created");

    // Create other essential tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS package_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        package_id INTEGER REFERENCES packages(id),
        tour_id INTEGER REFERENCES tours(id),
        total_amount INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        package_id INTEGER REFERENCES packages(id),
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id SERIAL PRIMARY KEY,
        title TEXT,
        subtitle TEXT,
        description TEXT,
        button_text TEXT,
        button_link TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add some basic data
    await client.query(`
      INSERT INTO package_categories (name, description) 
      VALUES 
        ('Beach & Resort', 'Beach and resort packages'),
        ('City Tours', 'Urban exploration packages'),
        ('Adventure', 'Adventure and outdoor packages'),
        ('Cultural', 'Cultural and historical packages')
      ON CONFLICT DO NOTHING
    `);

    await client.query(`
      INSERT INTO tour_categories (name, description)
      VALUES
        ('Sightseeing', 'City and landmark tours'),
        ('Adventure', 'Adventure and outdoor tours'), 
        ('Cultural', 'Cultural and historical tours'),
        ('Food & Drink', 'Culinary experiences')
      ON CONFLICT DO NOTHING
    `);

    console.log("✅ Basic categories added");

    client.release();
    console.log("🎉 Database initialization completed successfully!");
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

initializeDatabase().then(() => {
  console.log("🚀 Ready to proceed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Initialization failed:", error);
  process.exit(1);
});
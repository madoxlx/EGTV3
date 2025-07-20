import { pool } from "./db";

async function createTables() {
  console.log("Creating PostgreSQL tables...");

  try {
    await pool.query("BEGIN");

    // Countries
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Nationalities
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nationalities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Visas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visas (
        id SERIAL PRIMARY KEY,
        country_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        requirements JSONB,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
      );
    `);

    // Nationality Visa Requirements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nationality_visa_requirements (
        id SERIAL PRIMARY KEY,
        nationality_id INTEGER NOT NULL,
        visa_id INTEGER NOT NULL,
        is_required BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (nationality_id) REFERENCES nationalities(id) ON DELETE CASCADE,
        FOREIGN KEY (visa_id) REFERENCES visas(id) ON DELETE CASCADE
      );
    `);

    // Cities
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country_id INTEGER NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
      );
    `);

    // Airports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL,
        code TEXT UNIQUE,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
      );
    `);

    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT,
        full_name TEXT,
        nationality TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        bio TEXT,
        avatar_url TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Destinations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        country_id INTEGER,
        city_id INTEGER,
        description TEXT,
        image_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
      );
    `);

    // Package Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Tour Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Homepage Sections
    await pool.query(`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT,
        order_number INTEGER NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Packages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        slug TEXT UNIQUE,
        price INTEGER NOT NULL,
        discounted_price INTEGER,
        image_url TEXT,
        gallery_urls JSONB,
        duration INTEGER NOT NULL,
        rating INTEGER,
        review_count INTEGER DEFAULT 0,
        destination_id INTEGER,
        featured BOOLEAN DEFAULT FALSE,
        type TEXT,
        inclusions JSONB,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
      );
    `);

    // Bookings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        package_id INTEGER,
        booking_date TIMESTAMP NOT NULL DEFAULT NOW(),
        travel_date TIMESTAMP NOT NULL,
        number_of_travelers INTEGER NOT NULL,
        total_price INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
      );
    `);

    // Favorites
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL,
        destination_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, destination_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      );
    `);

    // Tours
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        gallery_urls JSONB,
        destination_id INTEGER,
        trip_type TEXT,
        duration INTEGER NOT NULL,
        date TIMESTAMP,
        num_passengers INTEGER,
        price INTEGER NOT NULL,
        discounted_price INTEGER,
        included JSONB,
        excluded JSONB,
        itinerary JSONB,
        max_group_size INTEGER,
        featured BOOLEAN DEFAULT FALSE,
        rating REAL,
        review_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
      );
    `);

    // Hotels
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        destination_id INTEGER,
        address TEXT,
        city TEXT,
        country TEXT,
        postal_code TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        image_url TEXT,
        stars INTEGER,
        amenities JSONB,
        check_in_time TIME,
        check_out_time TIME,
        longitude REAL,
        latitude REAL,
        featured BOOLEAN DEFAULT FALSE,
        rating REAL,
        review_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
      );
    `);

    // Rooms
    await pool.query(`
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
        image_url TEXT,
        size TEXT,
        bed_type TEXT,
        amenities JSONB,
        view TEXT,
        available BOOLEAN DEFAULT TRUE,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      );
    `);

    // Room Combinations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_combinations (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        adults_count INTEGER NOT NULL,
        children_count INTEGER NOT NULL DEFAULT 0,
        infants_count INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      );
    `);

    // Menus
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Menu Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER NOT NULL,
        parent_id INTEGER,
        title TEXT NOT NULL,
        url TEXT,
        icon TEXT,
        icon_type TEXT DEFAULT 'fas',
        item_type TEXT DEFAULT 'link',
        "order" INTEGER NOT NULL,
        target TEXT DEFAULT '_self',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE SET NULL
      );
    `);

    // Translations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL,
        en_text TEXT NOT NULL,
        ar_text TEXT,
        context TEXT,
        category TEXT,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        UNIQUE (key, category),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Site Language Settings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_language_settings (
        id SERIAL PRIMARY KEY,
        default_language TEXT NOT NULL DEFAULT 'en',
        available_languages JSONB DEFAULT '["en", "ar"]',
        rtl_languages JSONB DEFAULT '["ar"]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Dictionary Entries
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dictionary_entries (
        id SERIAL PRIMARY KEY,
        word TEXT NOT NULL,
        english_definition TEXT NOT NULL,
        arabic_translation TEXT NOT NULL,
        part_of_speech TEXT,
        context TEXT,
        example TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Transport Locations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transport_locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        location_type TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        popular BOOLEAN DEFAULT FALSE,
        latitude REAL,
        longitude REAL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Transport Durations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transport_durations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        hours INTEGER NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Transport Types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transport_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        passenger_capacity INTEGER NOT NULL,
        baggage_capacity INTEGER NOT NULL,
        default_features JSONB,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);

    // Transportation
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transportation (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type_id INTEGER,
        destination_id INTEGER,
        from_location_id INTEGER,
        to_location_id INTEGER,
        duration_id INTEGER,
        passenger_capacity INTEGER NOT NULL,
        baggage_capacity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        discounted_price INTEGER,
        image_url TEXT,
        gallery_urls JSONB,
        features JSONB,
        with_driver BOOLEAN DEFAULT TRUE,
        available BOOLEAN DEFAULT TRUE,
        pickup_included BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        rating REAL,
        review_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES transport_types(id) ON DELETE SET NULL,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
        FOREIGN KEY (from_location_id) REFERENCES transport_locations(id) ON DELETE SET NULL,
        FOREIGN KEY (to_location_id) REFERENCES transport_locations(id) ON DELETE SET NULL,
        FOREIGN KEY (duration_id) REFERENCES transport_durations(id) ON DELETE SET NULL
      );
    `);

    // Seed initial data for menus
    await pool.query(`
      INSERT INTO menus (name, location, description, active, created_at)
      VALUES
        ('Header Menu', 'header', 'Main navigation menu', TRUE, NOW()),
        ('Footer Menu', 'footer', 'Footer navigation menu', TRUE, NOW())
      ON CONFLICT (name) DO NOTHING;
    `);

    // Seed initial menu items
    await pool.query(`
      INSERT INTO menu_items (menu_id, title, url, "order", active, created_at)
      SELECT id, 'Home', '/', 1, TRUE, NOW() FROM menus WHERE location = 'header'
      ON CONFLICT DO NOTHING;
      INSERT INTO menu_items (menu_id, title, url, "order", active, created_at)
      SELECT id, 'About', '/about', 2, TRUE, NOW() FROM menus WHERE location = 'header'
      ON CONFLICT DO NOTHING;
      INSERT INTO menu_items (menu_id, title, url, "order", active, created_at)
      SELECT id, 'Contact', '/contact', 1, TRUE, NOW() FROM menus WHERE location = 'footer'
      ON CONFLICT DO NOTHING;
    `);

    await pool.query("COMMIT");
    console.log("All tables created and seeded successfully!");
    return { success: true };
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error creating tables:", error);
    return { success: false, error };
  }
}

// Execute the function
createTables()
  .then((result) => {
    if (result.success) {
      console.log("Schema creation completed.");
    } else {
      console.error("Schema creation failed:", result.error);
    }
  })
  .catch(console.error);

export { createTables };

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
        button_text TEXT,
        button_link TEXT,
        secondary_button_text TEXT,
        secondary_button_link TEXT,
        tourists_count TEXT DEFAULT '5000+',
        destinations_count TEXT DEFAULT '300+',
        hotels_count TEXT DEFAULT '200+',
        show_statistics BOOLEAN DEFAULT false,
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
        name TEXT,
        description TEXT NOT NULL,
        short_description TEXT,
        overview TEXT,
        slug TEXT UNIQUE,
        price DOUBLE PRECISION NOT NULL DEFAULT 0,
        original_price DOUBLE PRECISION,
        discounted_price INTEGER,
        currency TEXT DEFAULT 'USD',
        image_url TEXT,
        main_image_url TEXT,
        gallery_urls JSONB DEFAULT '[]',
        duration INTEGER NOT NULL DEFAULT 1,
        duration_type TEXT DEFAULT 'days',
        max_participants INTEGER DEFAULT 10,
        min_age INTEGER DEFAULT 0,
        max_age INTEGER DEFAULT 100,
        difficulty_level TEXT DEFAULT 'easy',
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        booking_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        wishlist_count INTEGER DEFAULT 0,
        destination_id INTEGER,
        country_id INTEGER,
        city_id INTEGER,
        category_id INTEGER,
        category TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        valid_until TIMESTAMP,
        booking_deadline TIMESTAMP,
        featured BOOLEAN DEFAULT FALSE,
        popular BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        availability_status TEXT DEFAULT 'available',
        type TEXT DEFAULT 'package',
        status TEXT DEFAULT 'active',
        inclusions JSONB,
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
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES package_categories(id) ON DELETE SET NULL
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

    // Cart Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        session_id VARCHAR(255),
        package_id INTEGER,
        tour_id INTEGER,
        hotel_id INTEGER,
        item_type VARCHAR(50) NOT NULL DEFAULT 'package',
        quantity INTEGER NOT NULL DEFAULT 1,
        price DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        selected_options JSONB DEFAULT '{}',
        special_requests TEXT,
        travel_date TIMESTAMP,
        number_of_travelers INTEGER DEFAULT 1,
        room_preferences JSONB DEFAULT '{}',
        meal_preferences JSONB DEFAULT '{}',
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        CONSTRAINT cart_items_user_or_session_check 
          CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);

    // Orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        session_id VARCHAR(255),
        order_number VARCHAR(100) NOT NULL UNIQUE,
        total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        billing_address JSONB DEFAULT '{}',
        shipping_address JSONB DEFAULT '{}',
        customer_info JSONB DEFAULT '{}',
        special_instructions TEXT,
        order_date TIMESTAMP NOT NULL DEFAULT NOW(),
        payment_date TIMESTAMP,
        completion_date TIMESTAMP,
        cancellation_date TIMESTAMP,
        cancellation_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT orders_user_or_session_check 
          CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);

    // Order Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        package_id INTEGER,
        tour_id INTEGER,
        hotel_id INTEGER,
        item_type VARCHAR(50) NOT NULL DEFAULT 'package',
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        selected_options JSONB DEFAULT '{}',
        travel_date TIMESTAMP,
        number_of_travelers INTEGER DEFAULT 1,
        room_preferences JSONB DEFAULT '{}',
        meal_preferences JSONB DEFAULT '{}',
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
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

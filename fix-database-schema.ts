import { pool } from "./server/db";

async function fixDatabaseSchema() {
  try {
    console.log("🔧 Starting database schema fixes...");
    
    const client = await pool.connect();
    
    // Fix packages table - add missing columns
    console.log("📦 Fixing packages table schema...");
    
    const packageColumnFixes = [
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS route TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS ideal_for JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS tour_selection JSONB", 
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_tour_id INTEGER",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS included_features JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS optional_excursions JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded_features JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS what_to_pack JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS travel_route JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS accommodation_highlights JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation_details JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation_price INTEGER",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'per_booking'",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 2",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS infant_count INTEGER DEFAULT 0",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS max_group_size INTEGER DEFAULT 15",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english'",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_hotels JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS rooms JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS cancellation_policy TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS children_policy TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded_items JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS custom_text TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS markup INTEGER",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS markup_type TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_type TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_value INTEGER",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS has_arabic_version BOOLEAN DEFAULT false",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS title_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS description_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS short_description_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS overview_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS best_time_to_visit_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS cancellation_policy_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS children_policy_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS terms_and_conditions_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS custom_text_ar TEXT",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS included_features_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded_features_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS ideal_for_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS what_to_pack_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS travel_route_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS optional_excursions_ar JSONB",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_by INTEGER",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS updated_by INTEGER"
    ];
    
    for (const query of packageColumnFixes) {
      await client.query(query);
    }
    console.log("✅ Packages table schema fixed");

    // Fix cart_items table - add missing columns
    console.log("🛒 Fixing cart_items table schema...");
    
    const cartColumnFixes = [
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS item_id INTEGER",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS item_type TEXT",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS item_name TEXT",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 1",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS infants INTEGER DEFAULT 0",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS check_in_date TIMESTAMP",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS check_out_date TIMESTAMP",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS travel_date TIMESTAMP",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS configuration JSONB",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS unit_price INTEGER",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS discounted_price INTEGER",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS total_price INTEGER",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS notes TEXT",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS created_by INTEGER",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS updated_by INTEGER"
    ];
    
    for (const query of cartColumnFixes) {
      await client.query(query);
    }
    console.log("✅ Cart items table schema fixed");

    // Fix homepage_sections table - add missing columns
    console.log("🏠 Fixing homepage_sections table schema...");
    
    const homepageColumnFixes = [
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS tourists_count TEXT DEFAULT '5000+'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS destinations_count TEXT DEFAULT '300+'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS hotels_count TEXT DEFAULT '150+'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS tourists_label TEXT DEFAULT 'Tourists'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS destinations_label TEXT DEFAULT 'Destinations'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS hotels_label TEXT DEFAULT 'Hotels'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS tourists_label_ar TEXT DEFAULT 'السياح'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS destinations_label_ar TEXT DEFAULT 'الوجهات'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS hotels_label_ar TEXT DEFAULT 'الفنادق'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature1_title TEXT DEFAULT 'Flexible Booking'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature1_description TEXT DEFAULT 'Free cancellation options available'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature1_icon TEXT DEFAULT 'calendar'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature2_title TEXT DEFAULT 'Expert Guides'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature2_description TEXT DEFAULT 'Local, knowledgeable tour guides'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature2_icon TEXT DEFAULT 'user-check'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS title_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS subtitle_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS description_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS button_text_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature1_title_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature1_description_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature2_title_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS feature2_description_ar TEXT",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS order_position INTEGER DEFAULT 0",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS show_statistics BOOLEAN DEFAULT true",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS show_features BOOLEAN DEFAULT true",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'left'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT 'white'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'black'",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS created_by INTEGER",
      "ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS updated_by INTEGER"
    ];
    
    for (const query of homepageColumnFixes) {
      await client.query(query);
    }
    console.log("✅ Homepage sections table schema fixed");

    // Fix bookings table - add missing columns
    console.log("📋 Fixing bookings table schema...");
    
    const bookingColumnFixes = [
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_id INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tour_id INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_id INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_date TIMESTAMP",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_date TIMESTAMP",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS number_of_travelers INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS adult_count INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS infant_count INTEGER DEFAULT 0",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_price INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EGP'",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_by INTEGER",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER"
    ];
    
    for (const query of bookingColumnFixes) {
      await client.query(query);
    }
    console.log("✅ Bookings table schema fixed");

    // Create missing tables if they don't exist
    console.log("🆕 Creating missing tables...");

    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number TEXT UNIQUE,
        user_id INTEGER,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'pending',
        total_amount INTEGER,
        currency TEXT DEFAULT 'EGP',
        payment_method TEXT,
        payment_reference TEXT,
        billing_address JSONB,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER
      )`,
      
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        item_type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        adults INTEGER DEFAULT 1,
        children INTEGER DEFAULT 0,
        infants INTEGER DEFAULT 0,
        check_in_date TIMESTAMP,
        check_out_date TIMESTAMP,
        travel_date TIMESTAMP,
        configuration JSONB,
        unit_price INTEGER NOT NULL,
        discounted_price INTEGER,
        total_price INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER,
        updated_by INTEGER
      )`,

      `CREATE TABLE IF NOT EXISTS package_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS tour_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    ];
    
    for (const query of createTableQueries) {
      await client.query(query);
    }
    console.log("✅ Missing tables created");

    // Add some default data
    console.log("📝 Adding default data...");
    
    // Add default package categories
    await client.query(`
      INSERT INTO package_categories (name, description) 
      VALUES 
        ('Beach & Resort', 'Beach and resort packages'),
        ('City Tours', 'Urban exploration packages'),
        ('Adventure', 'Adventure and outdoor packages'),
        ('Cultural', 'Cultural and historical packages')
      ON CONFLICT DO NOTHING
    `);

    // Add default tour categories  
    await client.query(`
      INSERT INTO tour_categories (name, description)
      VALUES
        ('Sightseeing', 'City and landmark tours'),
        ('Adventure', 'Adventure and outdoor tours'), 
        ('Cultural', 'Cultural and historical tours'),
        ('Food & Drink', 'Culinary experiences')
      ON CONFLICT DO NOTHING
    `);

    console.log("✅ Default data added");

    client.release();
    
    console.log("🎉 Database schema fixes completed successfully!");
    console.log("📊 Summary of fixes:");
    console.log("  ✅ Packages table: Added missing columns for manual packages");
    console.log("  ✅ Cart items table: Added missing columns for cart functionality");
    console.log("  ✅ Homepage sections: Added missing columns for sections");
    console.log("  ✅ Bookings table: Added missing columns for booking system");
    console.log("  ✅ Created missing tables: orders, order_items, categories");
    console.log("  ✅ Added default category data");
    
  } catch (error) {
    console.error("❌ Error fixing database schema:", error);
    throw error;
  }
}

// Run the script
fixDatabaseSchema().then(() => {
  console.log("🚀 Database schema fix completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Database schema fix failed:", error);
  process.exit(1);
});
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the external database URL directly
const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("Database URL: ebn elwes5a", databaseUrl.replace(/:[^:@]*@/, ':****@'));

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false
});

async function fixDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log("Starting database schema fixes...");

    // Fix hotels table - add missing columns
    console.log("Adding missing columns to hotels table...");
    
    const hotelColumns = [
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS short_description TEXT;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS destination_id INTEGER REFERENCES destinations(id);",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES hotel_categories(id);",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS postal_code TEXT;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone TEXT;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS email TEXT;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS website TEXT;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS check_in_time TEXT DEFAULT '15:00';",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS check_out_time TEXT DEFAULT '11:00';",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS guest_rating DOUBLE PRECISION;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS min_stay INTEGER DEFAULT 1;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS max_stay INTEGER;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS booking_lead_time INTEGER DEFAULT 0;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS airport_transfer_available BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS car_rental_available BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS shuttle_available BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS wifi_available BOOLEAN DEFAULT true;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS accessible_facilities BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS base_price INTEGER;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EGP';",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS tax_included BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS service_charge_included BOOLEAN DEFAULT false;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[\"en\"]'::jsonb;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS established_year INTEGER;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS last_renovated_year INTEGER;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_floors INTEGER;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS restaurants JSONB;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS landmarks JSONB;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS faqs JSONB;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS room_types JSONB;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);"
    ];

    for (const sql of hotelColumns) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql}`);
      } catch (error) {
        console.log(`⚠️ ${sql} - ${error.message}`);
      }
    }

    // Fix tours table - add missing title column
    console.log("\nAdding missing columns to tours table...");
    
    const tourColumns = [
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS title TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EGP';",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS gallery_urls JSONB;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS trip_type TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS num_passengers INTEGER;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS discounted_price INTEGER;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS included JSONB;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS excluded JSONB;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS max_group_size INTEGER;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS name_ar TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_ar TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_ar TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS included_ar JSONB;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS excluded_ar JSONB;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS has_arabic_version BOOLEAN DEFAULT false;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES tour_categories(id);",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'days';",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS date TIMESTAMP;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;",
      "ALTER TABLE tours ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;"
    ];

    for (const sql of tourColumns) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql}`);
      } catch (error) {
        console.log(`⚠️ ${sql} - ${error.message}`);
      }
    }

    // Update tours to copy name to title if title is empty
    console.log("\nCopying tour names to title field...");
    await client.query("UPDATE tours SET title = name WHERE title IS NULL OR title = '';");
    console.log("✅ Updated tour titles");

    // Fix cart_items table - add missing columns
    console.log("\nAdding missing columns to cart_items table...");
    
    const cartColumns = [
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS session_id TEXT;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS item_type TEXT;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS item_id INTEGER;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 1;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS infants INTEGER DEFAULT 0;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS check_in_date TIMESTAMP;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS check_out_date TIMESTAMP;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS travel_date TIMESTAMP;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS configuration JSONB;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS price_at_add INTEGER;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS discounted_price_at_add INTEGER;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS notes TEXT;",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);",
      "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);"
    ];

    for (const sql of cartColumns) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql}`);
      } catch (error) {
        console.log(`⚠️ ${sql} - ${error.message}`);
      }
    }

    // Fix packages table - add missing columns
    console.log("\nAdding missing columns to packages table...");
    
    const packageColumns = [
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS short_description TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS overview TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS gallery_urls JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'days';",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS rating INTEGER;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS destination_id INTEGER REFERENCES destinations(id);",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id);",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id);",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS category_id INTEGER;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS category TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS type TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS inclusions JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS route TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS ideal_for JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS tour_selection JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_tour_id INTEGER REFERENCES tours(id);",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS included_features JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS optional_excursions JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded_features JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS what_to_pack JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS travel_route JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS accommodation_highlights JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation_details JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation_price INTEGER;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'per_booking';",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 2;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS infant_count INTEGER DEFAULT 0;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS max_group_size INTEGER DEFAULT 15;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_hotels JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS rooms JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS children_policy TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded_items JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS custom_text TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS markup INTEGER;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS markup_type TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_type TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_value INTEGER;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS has_arabic_version BOOLEAN DEFAULT false;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS title_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS description_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS short_description_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS overview_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS best_time_to_visit_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS cancellation_policy_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS children_policy_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS terms_and_conditions_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS custom_text_ar TEXT;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS included_features_ar JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS excluded_features_ar JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS ideal_for_ar JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary_ar JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS what_to_pack_ar JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS travel_route_ar JSONB;",
      "ALTER TABLE packages ADD COLUMN IF NOT EXISTS optional_excursions_ar JSONB;"
    ];

    for (const sql of packageColumns) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql}`);
      } catch (error) {
        console.log(`⚠️ ${sql} - ${error.message}`);
      }
    }

    console.log("\n✅ Database schema fixes completed successfully!");
    console.log("The application should now work without column missing errors.");

  } catch (error) {
    console.error("❌ Error fixing database schema:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the schema fix
fixDatabaseSchema()
  .then(() => {
    console.log("✅ Schema fix completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Schema fix failed:", error);
    process.exit(1);
  });
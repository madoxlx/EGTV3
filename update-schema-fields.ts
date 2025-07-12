import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tours, packages } from "./shared/schema";

// Use the same database configuration as server/db.ts
const DATABASE_URL =
  process.env.DATABASE_URL ||
  '"postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=require"';

console.log(
  "Database URL configured:",
  DATABASE_URL.replace(/:[^:@]*@/, ":****@"),
);

// Create a postgres client connection
const sql = postgres(DATABASE_URL, {
  ssl: DATABASE_URL.includes("localhost") ? false : "require",
  max: 1,
  idle_timeout: 10,
  connect_timeout: 5,
  connection: {
    application_name: "schema-updater",
  },
});

const db = drizzle(sql);

async function updateSchemaFields() {
  try {
    console.log("🔄 Starting schema fields update...");

    // Add missing fields to tours table
    console.log("📝 Adding missing fields to tours table...");
    // Add startDate and endDate columns if they don't exist
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'start_date') THEN ALTER TABLE tours ADD COLUMN start_date TIMESTAMP; END IF; END $$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'end_date') THEN ALTER TABLE tours ADD COLUMN end_date TIMESTAMP; END IF; END $$;`;
    // Add trip_type
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'trip_type') THEN ALTER TABLE tours ADD COLUMN trip_type TEXT; END IF; END $$;`;
    // Add num_passengers
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'num_passengers') THEN ALTER TABLE tours ADD COLUMN num_passengers INTEGER; END IF; END $$;`;
    // Add discounted_price
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'discounted_price') THEN ALTER TABLE tours ADD COLUMN discounted_price INTEGER; END IF; END $$;`;
    // Add included
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'included') THEN ALTER TABLE tours ADD COLUMN included JSONB; END IF; END $$;`;
    // Add excluded
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'excluded') THEN ALTER TABLE tours ADD COLUMN excluded JSONB; END IF; END $$;`;
    // Add itinerary
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'itinerary') THEN ALTER TABLE tours ADD COLUMN itinerary TEXT; END IF; END $$;`;
    // Add max_group_size
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'max_group_size') THEN ALTER TABLE tours ADD COLUMN max_group_size INTEGER; END IF; END $$;`;
    // Add rating
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'rating') THEN ALTER TABLE tours ADD COLUMN rating DOUBLE PRECISION; END IF; END $$;`;
    // Add review_count
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'review_count') THEN ALTER TABLE tours ADD COLUMN review_count INTEGER DEFAULT 0; END IF; END $$;`;
    // Add status
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'status') THEN ALTER TABLE tours ADD COLUMN status TEXT DEFAULT 'active'; END IF; END $$;`;
    // Add Arabic fields
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'name_ar') THEN ALTER TABLE tours ADD COLUMN name_ar TEXT; END IF; END $$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'description_ar') THEN ALTER TABLE tours ADD COLUMN description_ar TEXT; END IF; END $$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'itinerary_ar') THEN ALTER TABLE tours ADD COLUMN itinerary_ar TEXT; END IF; END $$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'included_ar') THEN ALTER TABLE tours ADD COLUMN included_ar JSONB; END IF; END $$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'excluded_ar') THEN ALTER TABLE tours ADD COLUMN excluded_ar JSONB; END IF; END $$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'has_arabic_version') THEN ALTER TABLE tours ADD COLUMN has_arabic_version BOOLEAN DEFAULT FALSE; END IF; END $$;`;
    // Add category_id
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'category_id') THEN ALTER TABLE tours ADD COLUMN category_id INTEGER; END IF; END $$;`;

    // Add date column
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'date') THEN ALTER TABLE tours ADD COLUMN date TIMESTAMP; END IF; END $$;`;

    // Rename duration_days to duration if it exists
    await sql`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'duration_days') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'duration') THEN ALTER TABLE tours RENAME COLUMN duration_days TO duration; END IF; END $$;`;

    // Add duration column if it doesn't exist
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'duration') THEN ALTER TABLE tours ADD COLUMN duration INTEGER; END IF; END $$;`;

    // Add duration_type column
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'duration_type') THEN ALTER TABLE tours ADD COLUMN duration_type TEXT DEFAULT 'days'; END IF; END $$;`;

    // Add missing fields to packages table
    console.log("📝 Adding missing fields to packages table...");
    // overview
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'overview') THEN ALTER TABLE packages ADD COLUMN overview TEXT; END IF; END $$;`;
    // category
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'category') THEN ALTER TABLE packages ADD COLUMN category TEXT; END IF; END $$;`;
    // category_id - Package category reference
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'category_id') THEN ALTER TABLE packages ADD COLUMN category_id INTEGER; END IF; END $$;`;
    // selected_tour_id
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_tour_id') THEN ALTER TABLE packages ADD COLUMN selected_tour_id INTEGER REFERENCES tours(id); END IF; END $$;`;
    // transportation
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'transportation') THEN ALTER TABLE packages ADD COLUMN transportation TEXT; END IF; END $$;`;
    // transportation_price
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'transportation_price') THEN ALTER TABLE packages ADD COLUMN transportation_price INTEGER; END IF; END $$;`;
    // selected_hotels
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_hotels') THEN ALTER TABLE packages ADD COLUMN selected_hotels JSONB; END IF; END $$;`;
    // rooms
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'rooms') THEN ALTER TABLE packages ADD COLUMN rooms JSONB; END IF; END $$;`;

    console.log("✅ Schema fields updated successfully!");

    // Verify the changes
    console.log("🔍 Verifying changes...");

    const toursColumns =
      await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tours' ORDER BY ordinal_position;`;
    const packagesColumns =
      await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'packages' ORDER BY ordinal_position;`;

    console.log("📊 Tours table columns:");
    toursColumns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log("📊 Packages table columns:");
    packagesColumns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("❌ Error updating schema fields:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the update
updateSchemaFields()
  .then(() => {
    console.log("🎉 Schema fields update completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Schema fields update failed:", error);
    process.exit(1);
  });

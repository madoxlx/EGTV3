import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use the same database configuration as server/db.ts
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=require";

console.log("🔧 Fixing console errors and database issues...");

// Create a postgres client connection
const sql = postgres(DATABASE_URL, {
  ssl: DATABASE_URL.includes("localhost") ? false : "require",
  max: 1,
  idle_timeout: 10,
  connect_timeout: 5,
  connection: {
    application_name: "error-fixer",
  },
});

const db = drizzle(sql);

async function fixConsoleErrors() {
  try {
    console.log("📝 Checking database schema integrity...");

    // Check for any missing essential columns
    const packagesColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name IN ('id', 'title', 'description', 'price', 'category_id', 'categoryId')
      ORDER BY column_name
    `;

    console.log("📊 Essential packages columns:");
    packagesColumns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if there are any packages with null category_id causing issues
    const packagesWithNullCategory = await sql`
      SELECT COUNT(*) as count 
      FROM packages 
      WHERE category_id IS NULL
    `;

    console.log(`📈 Packages with null category_id: ${packagesWithNullCategory[0].count}`);

    // Check if there are any missing essential data fields
    const packagesWithMissingData = await sql`
      SELECT COUNT(*) as count 
      FROM packages 
      WHERE title IS NULL OR description IS NULL OR price IS NULL
    `;

    console.log(`⚠️ Packages with missing essential data: ${packagesWithMissingData[0].count}`);

    // Check for any data integrity issues
    const packagesWithIssues = await sql`
      SELECT id, title, price, category_id, type 
      FROM packages 
      WHERE title IS NULL OR description IS NULL OR price IS NULL OR price = 0
      LIMIT 5
    `;

    if (packagesWithIssues.length > 0) {
      console.log("🔍 Found packages with data issues:");
      packagesWithIssues.forEach(pkg => {
        console.log(`  - Package ${pkg.id}: ${pkg.title || 'NO TITLE'} (price: ${pkg.price}, category: ${pkg.category_id})`);
      });
    } else {
      console.log("✅ No packages found with data integrity issues");
    }

    // Check database connection and basic queries
    const totalPackages = await sql`SELECT COUNT(*) as count FROM packages`;
    const totalHotels = await sql`SELECT COUNT(*) as count FROM hotels`;
    const totalTours = await sql`SELECT COUNT(*) as count FROM tours`;

    console.log("📊 Database Statistics:");
    console.log(`  - Total packages: ${totalPackages[0].count}`);
    console.log(`  - Total hotels: ${totalHotels[0].count}`);
    console.log(`  - Total tours: ${totalTours[0].count}`);

    console.log("🎉 Database schema check completed!");

  } catch (error) {
    console.error("❌ Error during database check:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the fix
fixConsoleErrors()
  .then(() => {
    console.log("✅ Console errors analysis completed successfully");
    console.log("🔧 Next steps:");
    console.log("  1. Set GOOGLE_MAPS_API_KEY environment variable");
    console.log("  2. Check form validation schemas for Select components");
    console.log("  3. Review form submission handlers for empty object logging");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  });
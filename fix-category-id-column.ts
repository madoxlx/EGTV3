import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use the same database configuration as server/db.ts
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=require";

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
    application_name: "category-id-fixer",
  },
});

const db = drizzle(sql);

async function fixCategoryIdColumn() {
  try {
    console.log("🔄 Fixing category_id column in packages table...");

    // Check if the column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name = 'category_id'
    `;

    if (columnCheck.length === 0) {
      // Add the category_id column if it doesn't exist
      await sql`
        ALTER TABLE packages 
        ADD COLUMN category_id INTEGER
      `;
      console.log("✅ Successfully added category_id column to packages table");
    } else {
      console.log("ℹ️ Column category_id already exists in packages table");
    }

    // Verify the column was added
    const verifyColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name IN ('category_id', 'category')
      ORDER BY column_name
    `;

    console.log("📊 Packages table category columns:");
    verifyColumns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if we have any package categories to link
    const packageCategoriesCheck = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'package_categories'
    `;

    if (packageCategoriesCheck[0].count > 0) {
      console.log("📋 Package categories table exists, you can now link packages to categories");
    } else {
      console.log("⚠️ Package categories table doesn't exist - category_id can be used for manual categorization");
    }

    console.log("🎉 Category ID column fix completed successfully!");

  } catch (error) {
    console.error("❌ Error fixing category_id column:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the fix
fixCategoryIdColumn()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
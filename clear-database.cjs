const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database data...');
    
    // Get all table names in dependency order (reverse of creation order)
    const tables = [
      'nationality_visa_requirements',
      'visas',
      'nationalities',
      'menu_items',
      'menus',
      'why_choose_us_sections',
      'rooms',
      'hotel_highlights',
      'hotel_facilities',
      'cleanliness_features',
      'transport_types',
      'hotel_categories',
      'tour_categories',
      'package_categories',
      'site_language_settings',
      'translations',
      'room_combinations',
      'reviews',
      'payments',
      'notifications',
      'travelers',
      'coupons',
      'coupon_usages',
      'cart_items',
      'orders',
      'order_items',
      'bookings',
      'favorites',
      'hotels',
      'tours',
      'packages',
      'homepage_sections',
      'hero_slides',
      'destinations',
      'airports',
      'cities',
      'countries',
      'users'
    ];
    
    console.log(`📊 Clearing ${tables.length} tables in dependency order`);
    
    // Delete data from tables in reverse dependency order
    for (const tableName of tables) {
      try {
        const result = await db.execute(sql.raw(`DELETE FROM ${tableName}`));
        console.log(`✅ Cleared table: ${tableName}`);
      } catch (error) {
        console.log(`⚠️ Could not clear table ${tableName}: ${error.message}`);
      }
    }
    
    // Reset sequences
    for (const tableName of tables) {
      try {
        await db.execute(sql.raw(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`));
        console.log(`🔄 Reset sequence: ${tableName}_id_seq`);
      } catch (error) {
        // Ignore sequence errors for tables without sequences
      }
    }
    
    console.log('✅ Database cleared successfully');
    
    // Verify tables are empty
    const verification = await db.execute(sql`
      SELECT 
        table_name,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_name = t.table_name AND column_name = 'id'
        ) as has_id,
        (
          SELECT COUNT(*) 
          FROM information_schema.table_constraints 
          WHERE table_name = t.table_name AND constraint_type = 'PRIMARY KEY'
        ) as has_pk
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📈 Table verification:');
    for (const row of verification.rows) {
      try {
        const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${row.table_name}`));
        const count = countResult.rows[0].count;
        console.log(`  📊 ${row.table_name}: ${count} rows`);
      } catch (error) {
        console.log(`  ⚠️ ${row.table_name}: could not check`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await pool.end();
  }
}

clearDatabase();
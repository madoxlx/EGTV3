import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable';
const client = postgres(databaseUrl, { ssl: false });
const db = drizzle(client);

async function completeHotelsSchemaFix() {
  try {
    console.log('🔧 Completing hotels schema with final missing columns...');
    
    const currentColumns = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    const columnNames = currentColumns.map(col => col.column_name);
    
    // Add any remaining columns that might be missing
    const finalColumns = [
      { name: 'booking_lead_time', type: 'INTEGER' },
      { name: 'instant_booking', type: 'BOOLEAN DEFAULT false' },
      { name: 'prepayment_required', type: 'BOOLEAN DEFAULT false' },
      { name: 'free_cancellation', type: 'BOOLEAN DEFAULT false' },
      { name: 'breakfast_included', type: 'BOOLEAN DEFAULT false' },
      { name: 'dinner_included', type: 'BOOLEAN DEFAULT false' },
      { name: 'all_inclusive', type: 'BOOLEAN DEFAULT false' },
      { name: 'pool_type', type: 'TEXT' },
      { name: 'beach_access', type: 'BOOLEAN DEFAULT false' },
      { name: 'spa_services', type: 'JSONB' },
      { name: 'fitness_center', type: 'BOOLEAN DEFAULT false' },
      { name: 'business_services', type: 'JSONB' },
      { name: 'family_friendly', type: 'BOOLEAN DEFAULT false' },
      { name: 'adults_only', type: 'BOOLEAN DEFAULT false' },
      { name: 'eco_friendly', type: 'BOOLEAN DEFAULT false' },
      { name: 'loyalty_program', type: 'TEXT' },
      { name: 'property_type', type: 'TEXT' },
      { name: 'chain_name', type: 'TEXT' },
      { name: 'brand_name', type: 'TEXT' },
      { name: 'year_built', type: 'INTEGER' },
      { name: 'year_renovated', type: 'INTEGER' },
      { name: 'total_rooms', type: 'INTEGER' },
      { name: 'total_floors', type: 'INTEGER' },
      { name: 'elevator_count', type: 'INTEGER' },
      { name: 'meeting_rooms', type: 'INTEGER' },
      { name: 'event_spaces', type: 'JSONB' },
      { name: 'accessibility_features', type: 'JSONB' },
      { name: 'safety_features', type: 'JSONB' },
      { name: 'transport_options', type: 'JSONB' },
      { name: 'nearby_attractions', type: 'JSONB' },
      { name: 'seasonal_info', type: 'JSONB' },
      { name: 'special_offers', type: 'JSONB' },
      { name: 'contact_info', type: 'JSONB' },
      { name: 'social_media', type: 'JSONB' },
      { name: 'booking_policies', type: 'JSONB' },
      { name: 'payment_methods', type: 'JSONB' },
      { name: 'local_attractions', type: 'JSONB' },
      { name: 'weather_info', type: 'JSONB' },
      { name: 'currency_accepted', type: 'JSONB' },
      { name: 'time_zone', type: 'TEXT' }
    ];
    
    let addedCount = 0;
    
    for (const column of finalColumns) {
      if (!columnNames.includes(column.name)) {
        console.log(`➕ Adding column: ${column.name}`);
        await db.execute(sql.raw(`
          ALTER TABLE hotels ADD COLUMN ${column.name} ${column.type}
        `));
        addedCount++;
      }
    }
    
    const finalCount = await db.execute(sql`
      SELECT COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    
    console.log(`✅ Added ${addedCount} new columns`);
    console.log('✅ Total columns in hotels table:', finalCount[0].column_count);
    
    // Test hotel creation
    console.log('🧪 Testing hotel creation...');
    const testHotel = await db.execute(sql`
      INSERT INTO hotels (name, description, destination_id, address, phone, email, stars, status, city, country, postal_code, longitude, latitude, featured, rating, currency, pet_friendly, airport_transfer_available, features, review_count, active)
      VALUES ('Test Hotel Database', 'Test hotel for database verification', 1, '123 Test Street', '+201234567890', 'test@example.com', 4, 'active', 'Cairo', 'Egypt', '12345', 31.2357, 30.0444, false, 4.5, 'EGP', false, true, '[]', 25, true)
      RETURNING id, name
    `);
    
    console.log('✅ Hotel creation test successful:', testHotel[0]);
    
  } catch (error) {
    console.error('❌ Error completing hotels schema:', error);
    throw error;
  }
}

completeHotelsSchemaFix()
  .then(() => {
    console.log('🎉 Hotels schema completely fixed and tested');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to complete hotels schema fix:', error);
    process.exit(1);
  });
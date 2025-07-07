import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

/**
 * Add Arabic translation fields to packages table
 */
async function addArabicFieldsToPackages() {
  console.log('🔧 Adding Arabic translation fields to packages table...');
  
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const client = neon(DATABASE_URL);
    const db = drizzle(client);

    // List of Arabic fields to add
    const arabicFields = [
      'title_ar',
      'description_ar', 
      'short_description_ar',
      'overview_ar',
      'best_time_to_visit_ar',
      'cancellation_policy_ar',
      'children_policy_ar',
      'terms_and_conditions_ar',
      'custom_text_ar',
      'included_features_ar',
      'excluded_features_ar',
      'ideal_for_ar',
      'itinerary_ar',
      'what_to_pack_ar',
      'travel_route_ar',
      'optional_excursions_ar',
      'has_arabic_version'
    ];

    for (const field of arabicFields) {
      // Check if field exists
      const fieldCheck = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = ${field}
      `);
      
      if (fieldCheck.rows.length === 0) {
        let columnType = 'TEXT';
        
        // Set appropriate data types
        if (field === 'has_arabic_version') {
          columnType = 'BOOLEAN DEFAULT FALSE';
        } else if (field.endsWith('_ar') && (field.includes('features') || field.includes('ideal_for') || field.includes('itinerary') || field.includes('what_to_pack') || field.includes('travel_route') || field.includes('optional_excursions'))) {
          columnType = 'JSONB DEFAULT \'[]\'';
        }
        
        await db.execute(sql`
          ALTER TABLE packages 
          ADD COLUMN ${sql.raw(field)} ${sql.raw(columnType)}
        `);
        
        console.log(`✅ Added ${field} column to packages table`);
      } else {
        console.log(`ℹ️ Column ${field} already exists in packages table`);
      }
    }
    
    console.log('🎉 Arabic fields added to packages table successfully');
    
  } catch (error) {
    console.error('❌ Error adding Arabic fields to packages table:', error);
    process.exit(1);
  }
}

// Run the migration
addArabicFieldsToPackages();
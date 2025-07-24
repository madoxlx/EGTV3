import { db } from "./server/db";
import { sql } from "drizzle-orm";

/**
 * Fix the tours table JSON field issue by ensuring proper column types
 */
async function fixToursJsonIssue() {
  try {
    console.log('🔧 Fixing tours table JSON field issues...');

    // First, check current column types
    console.log('📊 Checking current column types...');
    const columnInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tours' 
      AND column_name IN ('itinerary', 'itinerary_ar', 'included', 'excluded', 'gallery_urls', 'included_ar', 'excluded_ar')
      ORDER BY column_name;
    `);
    
    console.log('Current column types:', columnInfo.rows);

    // Fix column types if needed
    console.log('🔄 Ensuring correct column types...');
    
    // Ensure itinerary fields are TEXT (not JSON)
    await db.execute(sql`
      DO $$ 
      BEGIN 
        -- Change itinerary to TEXT if it's not already
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'itinerary' 
          AND data_type != 'text'
        ) THEN
          ALTER TABLE tours ALTER COLUMN itinerary TYPE TEXT;
        END IF;
        
        -- Change itinerary_ar to TEXT if it's not already
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'itinerary_ar' 
          AND data_type != 'text'
        ) THEN
          ALTER TABLE tours ALTER COLUMN itinerary_ar TYPE TEXT;
        END IF;
      END $$;
    `);

    // Ensure JSON fields are proper JSONB
    await db.execute(sql`
      DO $$ 
      BEGIN 
        -- Ensure included is JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'included' 
          AND data_type != 'jsonb'
        ) THEN
          -- Convert to JSONB with proper handling
          ALTER TABLE tours ALTER COLUMN included TYPE JSONB USING 
            CASE 
              WHEN included IS NULL THEN '[]'::JSONB
              WHEN included::TEXT = '' THEN '[]'::JSONB
              ELSE included::JSONB
            END;
        END IF;
        
        -- Ensure excluded is JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'excluded' 
          AND data_type != 'jsonb'
        ) THEN
          ALTER TABLE tours ALTER COLUMN excluded TYPE JSONB USING 
            CASE 
              WHEN excluded IS NULL THEN '[]'::JSONB
              WHEN excluded::TEXT = '' THEN '[]'::JSONB
              ELSE excluded::JSONB
            END;
        END IF;
        
        -- Ensure gallery_urls is JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'gallery_urls' 
          AND data_type != 'jsonb'
        ) THEN
          ALTER TABLE tours ALTER COLUMN gallery_urls TYPE JSONB USING 
            CASE 
              WHEN gallery_urls IS NULL THEN '[]'::JSONB
              WHEN gallery_urls::TEXT = '' THEN '[]'::JSONB
              ELSE gallery_urls::JSONB
            END;
        END IF;
        
        -- Ensure included_ar is JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'included_ar' 
          AND data_type != 'jsonb'
        ) THEN
          ALTER TABLE tours ALTER COLUMN included_ar TYPE JSONB USING 
            CASE 
              WHEN included_ar IS NULL THEN '[]'::JSONB
              WHEN included_ar::TEXT = '' THEN '[]'::JSONB
              ELSE included_ar::JSONB
            END;
        END IF;
        
        -- Ensure excluded_ar is JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tours' AND column_name = 'excluded_ar' 
          AND data_type != 'jsonb'
        ) THEN
          ALTER TABLE tours ALTER COLUMN excluded_ar TYPE JSONB USING 
            CASE 
              WHEN excluded_ar IS NULL THEN '[]'::JSONB
              WHEN excluded_ar::TEXT = '' THEN '[]'::JSONB
              ELSE excluded_ar::JSONB
            END;
        END IF;
      END $$;
    `);

    console.log('✅ Column types fixed!');

    // Verify the changes
    console.log('🔍 Verifying column types after fix...');
    const updatedColumnInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tours' 
      AND column_name IN ('itinerary', 'itinerary_ar', 'included', 'excluded', 'gallery_urls', 'included_ar', 'excluded_ar')
      ORDER BY column_name;
    `);
    
    console.log('Updated column types:', updatedColumnInfo.rows);

    // Initialize any null JSON fields to empty arrays (separate updates to avoid syntax issues)
    console.log('🔄 Initializing null JSON fields...');
    await db.execute(sql`UPDATE tours SET included = '[]'::JSONB WHERE included IS NULL;`);
    await db.execute(sql`UPDATE tours SET excluded = '[]'::JSONB WHERE excluded IS NULL;`);
    await db.execute(sql`UPDATE tours SET gallery_urls = '[]'::JSONB WHERE gallery_urls IS NULL;`);
    await db.execute(sql`UPDATE tours SET included_ar = '[]'::JSONB WHERE included_ar IS NULL;`);
    await db.execute(sql`UPDATE tours SET excluded_ar = '[]'::JSONB WHERE excluded_ar IS NULL;`);

    console.log('✅ Tours table JSON field issues fixed successfully!');
    console.log('✅ Itinerary fields are now TEXT type');
    console.log('✅ JSON array fields are now JSONB type');
    console.log('✅ All null values initialized to empty arrays');

  } catch (error) {
    console.error('❌ Error fixing tours JSON issues:', error);
    throw error;
  }
}

// Run the fix
fixToursJsonIssue()
  .then(() => {
    console.log('🎉 Tours table schema fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Tours table schema fix failed:', error);
    process.exit(1);
  });
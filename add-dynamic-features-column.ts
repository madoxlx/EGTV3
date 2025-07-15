import { db } from './server/db';
import { sql } from 'drizzle-orm';

/**
 * Add dynamic features JSONB column to homepage_sections table
 * This supports unlimited features with icons and multilingual content
 */
async function addDynamicFeaturesColumn() {
  try {
    console.log('Adding dynamic features column to homepage_sections table...');
    
    // Check if the column already exists
    const columnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'homepage_sections' 
      AND column_name = 'features'
    `);
    
    if (columnExists.length > 0) {
      console.log('Features column already exists');
      return;
    }
    
    // Add the features column
    await db.execute(sql`
      ALTER TABLE homepage_sections 
      ADD COLUMN features JSONB DEFAULT '[]'::jsonb
    `);
    
    console.log('✅ Features column added successfully');
    
    // Update existing sections to have some default features if they don't have any
    await db.execute(sql`
      UPDATE homepage_sections 
      SET features = '[
        {
          "title": "Tailored and Reliable Service",
          "description": "We provide customized travel, timely transfers, and seamless plans.",
          "icon": "shield-check",
          "titleAr": "خدمة مخصصة وموثوقة",
          "descriptionAr": "نقدم سفر مخصص ونقل في الوقت المناسب وخطط سلسة."
        },
        {
          "title": "Exceptional Expertise and Comfort",
          "description": "Experience seamless travel with expert guides, skilled drivers, and reliable vehicles.",
          "icon": "users",
          "titleAr": "خبرة استثنائية وراحة",
          "descriptionAr": "استمتع بسفر سلس مع مرشدين خبراء وسائقين ماهرين ومركبات موثوقة."
        },
        {
          "title": "Transparent and Competitive Pricing",
          "description": "Enjoy premium services at transparent, fair rates for a stress-free journey.",
          "icon": "dollar-sign",
          "titleAr": "أسعار شفافة وتنافسية",
          "descriptionAr": "استمتع بخدمات مميزة بأسعار شفافة وعادلة لرحلة خالية من التوتر."
        }
      ]'::jsonb
      WHERE features IS NULL OR features = '[]'::jsonb
    `);
    
    console.log('✅ Default features added to existing sections');
    
  } catch (error) {
    console.error('Error adding features column:', error);
    throw error;
  }
}

// Run the migration
addDynamicFeaturesColumn()
  .then(() => {
    console.log('Dynamic features column migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
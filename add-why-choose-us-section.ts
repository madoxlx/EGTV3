import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

// Set fallback DATABASE_URL if not present (same as server/db.ts)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable";

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: false, // Disable SSL for self-signed certificate issues
});

const db = drizzle(pool);

/**
 * Add "Why Choose Us" section to homepage sections
 * This creates a section with 3 features matching the provided design
 */
async function addWhyChooseUsSection() {
  try {
    console.log('🔄 Adding "Why Choose Us" section to homepage...');

    // Insert the new "Why Choose Us" section
    const newSection = await db.execute(sql`
      INSERT INTO homepage_sections (
        title,
        subtitle,
        description,
        image_url,
        button_text,
        button_link,
        feature1_title,
        feature1_description,
        feature1_icon,
        feature2_title,
        feature2_description,
        feature2_icon,
        feature3_title,
        feature3_description,
        feature3_icon,
        title_ar,
        subtitle_ar,
        description_ar,
        button_text_ar,
        feature1_title_ar,
        feature1_description_ar,
        feature2_title_ar,
        feature2_description_ar,
        feature3_title_ar,
        feature3_description_ar,
        "order",
        active,
        show_statistics,
        show_features,
        image_position,
        background_color,
        text_color
      ) VALUES (
        'Why Choose Us',
        'Experience Excellence in Every Journey',
        'Discover what makes Egypt Express TVL your perfect travel partner for exploring the wonders of Egypt and beyond.',
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73862?w=800&h=600&fit=crop',
        'Book Your Journey',
        '/packages',
        'Tailored and Reliable Service',
        'We provide customized travel, timely transfers, and seamless plans.',
        'shield',
        'Exceptional Expertise and Comfort',
        'Experience seamless travel with expert guides, skilled drivers, and reliable vehicles.',
        'award',
        'Transparent and Competitive Pricing',
        'Enjoy premium services at transparent, fair rates for a stress-free journey.',
        'dollar-sign',
        'لماذا تختارنا',
        'تجربة التميز في كل رحلة',
        'اكتشف ما يجعل إيجيبت إكسبريس شريكك المثالي في السفر لاستكشاف عجائب مصر وما وراءها.',
        'احجز رحلتك',
        'خدمة مخصصة وموثوقة',
        'نوفر سفر مخصص ونقل في الوقت المحدد وخطط سلسة.',
        'خبرة استثنائية وراحة',
        'استمتع بسفر سلس مع مرشدين خبراء وسائقين ماهرين ومركبات موثوقة.',
        'أسعار شفافة وتنافسية',
        'استمتع بخدمات متميزة بأسعار شفافة وعادلة لرحلة خالية من التوتر.',
        1,
        true,
        false,
        true,
        'right',
        'white',
        'black'
      )
      RETURNING id
    `);

    console.log('✅ Successfully added "Why Choose Us" section');
    console.log('📋 Section details:');
    console.log('  - Title: Why Choose Us');
    console.log('  - Features: 3 features with icons');
    console.log('  - Feature 1: Tailored and Reliable Service (Shield icon)');
    console.log('  - Feature 2: Exceptional Expertise and Comfort (Award icon)');
    console.log('  - Feature 3: Transparent and Competitive Pricing (Dollar icon)');
    console.log('  - Arabic translations included');
    console.log('  - Statistics disabled, features enabled');
    console.log('  - Image position: right');
    console.log('  - Order: 1 (will appear first)');

    console.log('🎉 "Why Choose Us" section added successfully!');
    console.log('💡 You can now manage this section from /admin/homepage-sections');
    
  } catch (error) {
    console.error('❌ Error adding "Why Choose Us" section:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
addWhyChooseUsSection()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
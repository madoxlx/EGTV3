import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function setupHomepageSections() {
  try {
    console.log('Setting up homepage sections table...');
    
    // Create the table using raw SQL to ensure it exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        button_text TEXT,
        button_link TEXT,
        tourists_count TEXT DEFAULT '5000+',
        destinations_count TEXT DEFAULT '300+',
        hotels_count TEXT DEFAULT '150+',
        feature1_title TEXT DEFAULT 'Flexible Booking',
        feature1_description TEXT DEFAULT 'Free cancellation options available',
        feature1_icon TEXT DEFAULT 'calendar',
        feature2_title TEXT DEFAULT 'Expert Guides',
        feature2_description TEXT DEFAULT 'Local, knowledgeable tour guides',
        feature2_icon TEXT DEFAULT 'user-check',
        title_ar TEXT,
        subtitle_ar TEXT,
        description_ar TEXT,
        button_text_ar TEXT,
        feature1_title_ar TEXT,
        feature1_description_ar TEXT,
        feature2_title_ar TEXT,
        feature2_description_ar TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        show_statistics BOOLEAN DEFAULT true,
        show_features BOOLEAN DEFAULT true,
        image_position TEXT DEFAULT 'left',
        background_color TEXT DEFAULT 'white',
        text_color TEXT DEFAULT 'black',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      )
    `);
    
    console.log('✅ Homepage sections table created successfully');
    
    // Insert sample data
    await db.execute(sql`
      INSERT INTO homepage_sections (
        title, subtitle, description, image_url, button_text, button_link,
        tourists_count, destinations_count, hotels_count,
        feature1_title, feature1_description, feature1_icon,
        feature2_title, feature2_description, feature2_icon,
        title_ar, subtitle_ar, description_ar, button_text_ar,
        feature1_title_ar, feature1_description_ar,
        feature2_title_ar, feature2_description_ar,
        "order", active, show_statistics, show_features,
        image_position, background_color, text_color
      ) VALUES (
        'Experience Egypt''s Wonders',
        'Discover the Land of Pharaohs', 
        'Embark on an unforgettable journey through ancient pyramids, bustling markets, and timeless Nile cruises in the heart of Egypt.',
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f12?w=800&q=80',
        'Explore Tours',
        '/tours',
        '10,000+',
        '50+', 
        '200+',
        'Expert Local Guides',
        'Professional guides with deep knowledge of Egyptian history',
        'user-check',
        'All-Inclusive Packages',
        'Everything included from accommodation to meals',
        'calendar',
        'اكتشف عجائب مصر',
        'اكتشف أرض الفراعنة',
        'انطلق في رحلة لا تُنسى عبر الأهرامات القديمة والأسواق الصاخبة ورحلات النيل الخالدة في قلب مصر.',
        'استكشف الجولات',
        'مرشدين محليين خبراء',
        'مرشدين محترفين لديهم معرفة عميقة بالتاريخ المصري',
        'باقات شاملة',
        'كل شيء مدرج من الإقامة إلى الوجبات',
        1,
        true,
        true,
        true,
        'right',
        'white',
        'black'
      ) ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Sample homepage section created');
    
    // Verify the data was inserted
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM homepage_sections`);
    console.log('📊 Total homepage sections in database:', result.rows[0].count);
    
    console.log('\n🎉 Homepage sections setup complete!');
    console.log('📝 Next steps:');
    console.log('1. Start the development server with: npm run dev');
    console.log('2. Visit /admin/homepage-sections to manage content');
    console.log('3. Visit / to see dynamic sections on homepage');
    
  } catch (error) {
    console.error('❌ Error setting up homepage sections:', error);
  }
}

setupHomepageSections();
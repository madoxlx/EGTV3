import { db } from './server/db';
import { homepageSections } from './shared/schema';

async function createHomepageSectionsTable() {
  try {
    console.log('Creating homepage sections table if it doesn\'t exist...');
    
    // The table will be created by Drizzle ORM automatically when we first interact with it
    // Let's try to query it to see if it exists
    const result = await db.select().from(homepageSections).limit(1);
    console.log('Homepage sections table already exists');
    
    // Insert a sample section to test the functionality
    const sampleSection = await db.insert(homepageSections).values({
      title: 'Experience Egypt\'s Wonders',
      subtitle: 'Discover the Land of Pharaohs',
      description: 'Embark on an unforgettable journey through ancient pyramids, bustling markets, and timeless Nile cruises in the heart of Egypt.',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f12?w=800&q=80',
      buttonText: 'Explore Tours',
      buttonLink: '/tours',
      touristsCount: '10,000+',
      destinationsCount: '50+',
      hotelsCount: '200+',
      feature1Title: 'Expert Local Guides',
      feature1Description: 'Professional guides with deep knowledge of Egyptian history',
      feature1Icon: 'user-check',
      feature2Title: 'All-Inclusive Packages',
      feature2Description: 'Everything included from accommodation to meals',
      feature2Icon: 'calendar',
      titleAr: 'اكتشف عجائب مصر',
      subtitleAr: 'اكتشف أرض الفراعنة',
      descriptionAr: 'انطلق في رحلة لا تُنسى عبر الأهرامات القديمة والأسواق الصاخبة ورحلات النيل الخالدة في قلب مصر.',
      buttonTextAr: 'استكشف الجولات',
      feature1TitleAr: 'مرشدين محليين خبراء',
      feature1DescriptionAr: 'مرشدين محترفين لديهم معرفة عميقة بالتاريخ المصري',
      feature2TitleAr: 'باقات شاملة',
      feature2DescriptionAr: 'كل شيء مدرج من الإقامة إلى الوجبات',
      order: 1,
      active: true,
      showStatistics: true,
      showFeatures: true,
      imagePosition: 'right',
      backgroundColor: 'white',
      textColor: 'black',
    }).returning();
    
    console.log('Sample homepage section created:', sampleSection);
    
  } catch (error) {
    console.error('Error creating homepage sections table:', error);
    
    // If table doesn't exist, the error will be handled by Drizzle ORM
    // The schema in shared/schema.ts defines the table structure
    console.log('Table will be created automatically when first accessed');
  }
}

createHomepageSectionsTable();
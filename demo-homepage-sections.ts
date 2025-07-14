import { db } from './server/db';
import { homepageSections } from './shared/schema';
import { eq } from 'drizzle-orm';

async function demoHomepageSections() {
  console.log('🎬 Dynamic Homepage Sections Demo\n');
  
  try {
    // 1. Show current sections
    console.log('📋 Current Homepage Sections:');
    const sections = await db.select().from(homepageSections).orderBy(homepageSections.order);
    
    sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title}`);
      console.log(`   Subtitle: ${section.subtitle}`);
      console.log(`   Active: ${section.active ? '✅' : '❌'}`);
      console.log(`   Statistics: ${section.showStatistics ? '📊' : '🚫'}`);
      console.log(`   Features: ${section.showFeatures ? '⭐' : '🚫'}`);
      console.log(`   Image Position: ${section.imagePosition}`);
      console.log();
    });
    
    // 2. Create a new section
    console.log('➕ Creating new homepage section...');
    const newSection = await db.insert(homepageSections).values({
      title: 'Luxury Nile Cruises',
      subtitle: 'Sail Through Ancient History',
      description: 'Experience Egypt in ultimate comfort aboard our luxury Nile cruise ships, featuring world-class amenities and expert guides.',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      buttonText: 'Book Cruise',
      buttonLink: '/packages',
      touristsCount: '5,000+',
      destinationsCount: '12+',
      hotelsCount: '6+',
      feature1Title: 'Luxury Suites',
      feature1Description: 'Elegant rooms with panoramic Nile views',
      feature1Icon: 'hotel',
      feature2Title: '5-Star Dining',
      feature2Description: 'Gourmet meals with local and international cuisine',
      feature2Icon: 'utensils',
      titleAr: 'رحلات نيلية فاخرة',
      subtitleAr: 'إبحر عبر التاريخ القديم',
      descriptionAr: 'استمتع بتجربة مصر في أقصى درجات الراحة على متن سفن رحلات النيل الفاخرة، التي تضم مرافق عالمية المستوى ومرشدين خبراء.',
      buttonTextAr: 'احجز الرحلة',
      feature1TitleAr: 'أجنحة فاخرة',
      feature1DescriptionAr: 'غرف أنيقة مع إطلالات بانورامية على النيل',
      feature2TitleAr: 'مطاعم 5 نجوم',
      feature2DescriptionAr: 'وجبات شهية مع المأكولات المحلية والعالمية',
      order: 2,
      active: true,
      showStatistics: true,
      showFeatures: true,
      imagePosition: 'left',
      backgroundColor: 'blue',
      textColor: 'white'
    }).returning();
    
    console.log('✅ New section created:', newSection[0].title);
    
    // 3. Update existing section
    console.log('✏️ Updating existing section...');
    const updatedSection = await db.update(homepageSections)
      .set({
        touristsCount: '15,000+',
        destinationsCount: '60+',
        hotelsCount: '250+',
        updatedAt: new Date()
      })
      .where(eq(homepageSections.id, 1))
      .returning();
    
    console.log('✅ Section updated with new statistics');
    
    // 4. Show final sections
    console.log('\n📋 Final Homepage Sections:');
    const finalSections = await db.select().from(homepageSections).orderBy(homepageSections.order);
    
    finalSections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title}`);
      console.log(`   Order: ${section.order}`);
      console.log(`   Statistics: ${section.touristsCount} tourists, ${section.destinationsCount} destinations, ${section.hotelsCount} hotels`);
      console.log(`   Background: ${section.backgroundColor}, Text: ${section.textColor}`);
      console.log();
    });
    
    console.log('🎉 Demo Complete!');
    console.log('\n📝 Features Demonstrated:');
    console.log('✅ Dynamic content creation');
    console.log('✅ Multilingual support (English/Arabic)');
    console.log('✅ Statistics display');
    console.log('✅ Feature highlights');
    console.log('✅ Customizable styling');
    console.log('✅ Ordering system');
    console.log('✅ Active/inactive states');
    
    console.log('\n🚀 Ready for Use:');
    console.log('• Admin can manage sections at /admin/homepage-sections');
    console.log('• Visitors see dynamic content on homepage');
    console.log('• Full CRUD operations available');
    console.log('• Real-time updates');
    
  } catch (error) {
    console.error('❌ Demo error:', error);
  }
}

demoHomepageSections();
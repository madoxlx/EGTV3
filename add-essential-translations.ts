/**
 * Add essential translations via API to test the system
 */

import { db } from './server/db';
import { translations } from './shared/schema';

async function addEssentialTranslations() {
  console.log('🔧 Adding essential translations...');
  
  try {
    const essentialTranslations = [
      // Navigation
      { key: 'nav.home', enText: 'Home', arText: 'الرئيسية', category: 'navigation' },
      { key: 'nav.destinations', enText: 'Destinations', arText: 'الوجهات', category: 'navigation' },
      { key: 'nav.tours', enText: 'Tours', arText: 'الجولات', category: 'navigation' },
      { key: 'nav.packages', enText: 'Packages', arText: 'الباقات', category: 'navigation' },
      { key: 'nav.hotels', enText: 'Hotels', arText: 'الفنادق', category: 'navigation' },
      { key: 'nav.about', enText: 'About', arText: 'حول', category: 'navigation' },
      { key: 'nav.contact', enText: 'Contact', arText: 'اتصل', category: 'navigation' },
      
      // Admin Navigation
      { key: 'admin.nav.dashboard', enText: 'Dashboard', arText: 'لوحة التحكم', category: 'admin' },
      { key: 'admin.nav.packages', enText: 'Packages', arText: 'الباقات', category: 'admin' },
      { key: 'admin.nav.tours', enText: 'Tours', arText: 'الجولات', category: 'admin' },
      { key: 'admin.nav.hotels', enText: 'Hotels', arText: 'الفنادق', category: 'admin' },
      { key: 'admin.nav.destinations', enText: 'Destinations', arText: 'الوجهات', category: 'admin' },
      { key: 'admin.nav.translations', enText: 'Translation Management', arText: 'إدارة الترجمة', category: 'admin' },
      { key: 'admin.nav.settings', enText: 'Settings', arText: 'الإعدادات', category: 'admin' },
      
      // Common Actions
      { key: 'common.save', enText: 'Save', arText: 'حفظ', category: 'common' },
      { key: 'common.cancel', enText: 'Cancel', arText: 'إلغاء', category: 'common' },
      { key: 'common.edit', enText: 'Edit', arText: 'تعديل', category: 'common' },
      { key: 'common.delete', enText: 'Delete', arText: 'حذف', category: 'common' },
      { key: 'common.create', enText: 'Create', arText: 'إنشاء', category: 'common' },
      { key: 'common.loading', enText: 'Loading...', arText: 'جاري التحميل...', category: 'common' },
      { key: 'common.search', enText: 'Search', arText: 'بحث', category: 'common' },
      
      // Form Labels
      { key: 'form.name', enText: 'Name', arText: 'الاسم', category: 'form' },
      { key: 'form.description', enText: 'Description', arText: 'الوصف', category: 'form' },
      { key: 'form.price', enText: 'Price', arText: 'السعر', category: 'form' },
      { key: 'form.location', enText: 'Location', arText: 'الموقع', category: 'form' },
      
      // Translation Management
      { key: 'translations.title', enText: 'Translation Management', arText: 'إدارة الترجمة', category: 'admin' },
      { key: 'translations.add', enText: 'Add Translation', arText: 'إضافة ترجمة', category: 'admin' },
      { key: 'translations.key', enText: 'Translation Key', arText: 'مفتاح الترجمة', category: 'admin' },
      { key: 'translations.english', enText: 'English Text', arText: 'النص الإنجليزي', category: 'admin' },
      { key: 'translations.arabic', enText: 'Arabic Text', arText: 'النص العربي', category: 'admin' },
    ];
    
    // Insert each translation
    for (const translation of essentialTranslations) {
      try {
        await db.insert(translations).values(translation);
        console.log(`✅ Added: ${translation.key}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`⚠️ Already exists: ${translation.key}`);
        } else {
          console.log(`❌ Failed to add: ${translation.key} - ${error.message}`);
        }
      }
    }
    
    // Final count
    const finalCount = await db.select().from(translations);
    console.log(`📊 Total translations: ${finalCount.length}`);
    console.log('✅ Essential translations added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
addEssentialTranslations()
  .then(() => {
    console.log('🎉 Completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
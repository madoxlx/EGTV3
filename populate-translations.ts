/**
 * Populate essential translations for the platform
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function populateTranslations() {
  console.log('🔧 Populating essential translations...');
  
  try {
    const essentialTranslations = [
      ['nav.home', 'Home', 'الرئيسية', 'navigation'],
      ['nav.destinations', 'Destinations', 'الوجهات', 'navigation'],
      ['nav.tours', 'Tours', 'الجولات', 'navigation'],
      ['nav.packages', 'Packages', 'الباقات', 'navigation'],
      ['nav.hotels', 'Hotels', 'الفنادق', 'navigation'],
      ['nav.about', 'About', 'حول', 'navigation'],
      ['nav.contact', 'Contact', 'اتصل', 'navigation'],
      ['admin.nav.dashboard', 'Dashboard', 'لوحة التحكم', 'admin'],
      ['admin.nav.packages', 'Packages', 'الباقات', 'admin'],
      ['admin.nav.tours', 'Tours', 'الجولات', 'admin'],
      ['admin.nav.hotels', 'Hotels', 'الفنادق', 'admin'],
      ['admin.nav.destinations', 'Destinations', 'الوجهات', 'admin'],
      ['admin.nav.translations', 'Translation Management', 'إدارة الترجمة', 'admin'],
      ['admin.nav.settings', 'Settings', 'الإعدادات', 'admin'],
      ['common.save', 'Save', 'حفظ', 'common'],
      ['common.cancel', 'Cancel', 'إلغاء', 'common'],
      ['common.edit', 'Edit', 'تعديل', 'common'],
      ['common.delete', 'Delete', 'حذف', 'common'],
      ['common.create', 'Create', 'إنشاء', 'common'],
      ['common.loading', 'Loading...', 'جاري التحميل...', 'common'],
      ['translations.title', 'Translation Management', 'إدارة الترجمة', 'admin'],
      ['translations.add', 'Add Translation', 'إضافة ترجمة', 'admin'],
      ['translations.key', 'Translation Key', 'مفتاح الترجمة', 'admin'],
      ['translations.english', 'English Text', 'النص الإنجليزي', 'admin'],
      ['translations.arabic', 'Arabic Text', 'النص العربي', 'admin']
    ];
    
    for (const [key, enText, arText, category] of essentialTranslations) {
      try {
        // Check if translation already exists
        const existing = await db.execute(sql`SELECT id FROM translations WHERE key = ${key};`);
        
        if (existing.rows.length === 0) {
          await db.execute(sql`
            INSERT INTO translations (key, en_text, ar_text, category, created_at, updated_at)
            VALUES (${key}, ${enText}, ${arText}, ${category}, NOW(), NOW());
          `);
          console.log(`✅ Added: ${key}`);
        } else {
          console.log(`⚪ Already exists: ${key}`);
        }
      } catch (error: any) {
        console.log(`❌ Failed: ${key} - ${error.message}`);
      }
    }
    
    // Final count and samples
    const finalCount = await db.execute(sql`SELECT COUNT(*) as count FROM translations;`);
    console.log(`📊 Total translations: ${finalCount.rows[0].count}`);
    
    const samples = await db.execute(sql`SELECT key, en_text, ar_text FROM translations ORDER BY key LIMIT 10;`);
    console.log('📋 Sample translations:');
    samples.rows.forEach((row: any) => {
      console.log(`  - ${row.key}: "${row.en_text}" | "${row.ar_text || 'N/A'}"`);
    });
    
    console.log('✅ Translation population completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error populating translations:', error.message);
    throw error;
  }
}

// Run the population
populateTranslations()
  .then(() => {
    console.log('🎉 Population completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Population failed:', error);
    process.exit(1);
  });
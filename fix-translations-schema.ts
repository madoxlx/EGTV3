/**
 * Fix translations database schema to match expected structure
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function fixTranslationsSchema() {
  console.log('🔧 Fixing translations database schema...');
  
  try {
    // Step 1: Make language and value columns nullable (so existing data isn't lost)
    console.log('1. Making old columns nullable...');
    await db.execute(sql`ALTER TABLE translations ALTER COLUMN language DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE translations ALTER COLUMN value DROP NOT NULL;`);
    console.log('✅ Made language and value columns nullable');
    
    // Step 2: Update existing data to use the new structure
    console.log('2. Migrating existing data...');
    
    // For the existing welcome translation, ensure en_text is populated
    await db.execute(sql`
      UPDATE translations 
      SET en_text = COALESCE(en_text, value, 'Welcome to Sahara Journeys'),
          ar_text = COALESCE(ar_text, 'مرحباً بكم في رحلات الصحراء')
      WHERE key = 'welcome';
    `);
    
    console.log('✅ Migrated existing data');
    
    // Step 3: Test the new structure
    console.log('3. Testing new structure...');
    
    // Try to insert a test translation using the new structure
    const testTranslation = await db.execute(sql`
      INSERT INTO translations (key, en_text, ar_text, category, context, created_at, updated_at)
      VALUES ('test.schema', 'Test Schema', 'اختبار المخطط', 'test', 'Schema test', NOW(), NOW())
      RETURNING id, key, en_text, ar_text;
    `);
    
    console.log('✅ Test insert successful:', testTranslation.rows[0]);
    
    // Clean up test record
    await db.execute(sql`DELETE FROM translations WHERE key = 'test.schema';`);
    
    // Step 4: Add essential translations using the correct structure
    console.log('4. Adding essential translations...');
    
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
      ['common.loading', 'Loading...', 'جاري التحميل...', 'common']
    ];
    
    for (const [key, enText, arText, category] of essentialTranslations) {
      try {
        await db.execute(sql`
          INSERT INTO translations (key, en_text, ar_text, category, created_at, updated_at)
          VALUES (${key}, ${enText}, ${arText}, ${category}, NOW(), NOW())
          ON CONFLICT (key) DO UPDATE SET
            en_text = ${enText},
            ar_text = ${arText},
            category = ${category},
            updated_at = NOW();
        `);
        console.log(`✅ Added/Updated: ${key}`);
      } catch (error: any) {
        console.log(`⚠️ Skipped: ${key} - ${error.message}`);
      }
    }
    
    // Step 5: Final verification
    console.log('5. Final verification...');
    const finalCount = await db.execute(sql`SELECT COUNT(*) as count FROM translations;`);
    console.log(`📊 Total translations: ${finalCount.rows[0].count}`);
    
    // Show some sample translations
    const samples = await db.execute(sql`SELECT key, en_text, ar_text FROM translations LIMIT 5;`);
    console.log('📋 Sample translations:');
    samples.rows.forEach((row: any) => {
      console.log(`  - ${row.key}: "${row.en_text}" | "${row.ar_text || 'N/A'}"`);
    });
    
    console.log('✅ Translations schema fix completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error fixing schema:', error.message);
    throw error;
  }
}

// Run the fix
fixTranslationsSchema()
  .then(() => {
    console.log('🎉 Schema fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema fix failed:', error);
    process.exit(1);
  });
/**
 * Complete fix for the translations system
 */

import { db } from './server/db';
import { translations, siteLanguageSettings } from './shared/schema';
import { eq, isNull, or } from 'drizzle-orm';

async function fixTranslationsSystem() {
  console.log('🔧 Fixing translations system...');
  
  try {
    // Step 1: Clean up null or invalid translations
    console.log('🧹 Cleaning up invalid translations...');
    
    const invalidTranslations = await db
      .select()
      .from(translations)
      .where(
        or(
          eq(translations.enText, 'null'),
          isNull(translations.enText),
          eq(translations.enText, '')
        )
      );
    
    console.log(`🗑️ Found ${invalidTranslations.length} invalid translations to clean up`);
    
    // Delete invalid translations
    if (invalidTranslations.length > 0) {
      for (const invalid of invalidTranslations) {
        await db.delete(translations).where(eq(translations.id, invalid.id));
        console.log(`❌ Deleted invalid translation: ${invalid.key}`);
      }
    }
    
    // Step 2: Create comprehensive translations for the admin interface
    console.log('📝 Creating comprehensive admin translations...');
    
    const adminTranslations = [
      // Admin Navigation
      { key: 'admin.nav.dashboard', enText: 'Dashboard', arText: 'لوحة التحكم', category: 'admin' },
      { key: 'admin.nav.packages', enText: 'Packages', arText: 'الباقات', category: 'admin' },
      { key: 'admin.nav.tours', enText: 'Tours', arText: 'الجولات', category: 'admin' },
      { key: 'admin.nav.hotels', enText: 'Hotels', arText: 'الفنادق', category: 'admin' },
      { key: 'admin.nav.destinations', enText: 'Destinations', arText: 'الوجهات', category: 'admin' },
      { key: 'admin.nav.users', enText: 'Users', arText: 'المستخدمين', category: 'admin' },
      { key: 'admin.nav.settings', enText: 'Settings', arText: 'الإعدادات', category: 'admin' },
      
      // Common Actions
      { key: 'common.save', enText: 'Save', arText: 'حفظ', category: 'common' },
      { key: 'common.cancel', enText: 'Cancel', arText: 'إلغاء', category: 'common' },
      { key: 'common.edit', enText: 'Edit', arText: 'تعديل', category: 'common' },
      { key: 'common.delete', enText: 'Delete', arText: 'حذف', category: 'common' },
      { key: 'common.create', enText: 'Create', arText: 'إنشاء', category: 'common' },
      { key: 'common.update', enText: 'Update', arText: 'تحديث', category: 'common' },
      { key: 'common.view', enText: 'View', arText: 'عرض', category: 'common' },
      { key: 'common.search', enText: 'Search', arText: 'بحث', category: 'common' },
      { key: 'common.filter', enText: 'Filter', arText: 'تصفية', category: 'common' },
      { key: 'common.sort', enText: 'Sort', arText: 'ترتيب', category: 'common' },
      { key: 'common.loading', enText: 'Loading...', arText: 'جاري التحميل...', category: 'common' },
      { key: 'common.error', enText: 'Error', arText: 'خطأ', category: 'common' },
      { key: 'common.success', enText: 'Success', arText: 'نجح', category: 'common' },
      
      // Main Website Navigation
      { key: 'nav.home', enText: 'Home', arText: 'الرئيسية', category: 'navigation' },
      { key: 'nav.destinations', enText: 'Destinations', arText: 'الوجهات', category: 'navigation' },
      { key: 'nav.tours', enText: 'Tours', arText: 'الجولات', category: 'navigation' },
      { key: 'nav.packages', enText: 'Packages', arText: 'الباقات', category: 'navigation' },
      { key: 'nav.hotels', enText: 'Hotels', arText: 'الفنادق', category: 'navigation' },
      { key: 'nav.about', enText: 'About', arText: 'حول', category: 'navigation' },
      { key: 'nav.contact', enText: 'Contact', arText: 'اتصل', category: 'navigation' },
      
      // Translation Management
      { key: 'admin.translations.title', enText: 'Translation Management', arText: 'إدارة الترجمة', category: 'admin' },
      { key: 'admin.translations.add', enText: 'Add Translation', arText: 'إضافة ترجمة', category: 'admin' },
      { key: 'admin.translations.key', enText: 'Translation Key', arText: 'مفتاح الترجمة', category: 'admin' },
      { key: 'admin.translations.english', enText: 'English Text', arText: 'النص الإنجليزي', category: 'admin' },
      { key: 'admin.translations.arabic', enText: 'Arabic Text', arText: 'النص العربي', category: 'admin' },
      { key: 'admin.translations.category', enText: 'Category', arText: 'الفئة', category: 'admin' },
      { key: 'admin.translations.context', enText: 'Context', arText: 'السياق', category: 'admin' },
      
      // Language Settings
      { key: 'admin.translations.settings.title', enText: 'Language Settings', arText: 'إعدادات اللغة', category: 'admin' },
      { key: 'admin.translations.settings.defaultLanguage', enText: 'Default Language', arText: 'اللغة الافتراضية', category: 'admin' },
      { key: 'admin.translations.settings.availableLanguages', enText: 'Available Languages', arText: 'اللغات المتاحة', category: 'admin' },
      { key: 'admin.translations.settings.rtlLanguages', enText: 'RTL Languages', arText: 'لغات الكتابة من اليمين لليسار', category: 'admin' },
      
      // Form Fields
      { key: 'form.name', enText: 'Name', arText: 'الاسم', category: 'form' },
      { key: 'form.title', enText: 'Title', arText: 'العنوان', category: 'form' },
      { key: 'form.description', enText: 'Description', arText: 'الوصف', category: 'form' },
      { key: 'form.price', enText: 'Price', arText: 'السعر', category: 'form' },
      { key: 'form.duration', enText: 'Duration', arText: 'المدة', category: 'form' },
      { key: 'form.location', enText: 'Location', arText: 'الموقع', category: 'form' },
      { key: 'form.image', enText: 'Image', arText: 'الصورة', category: 'form' },
      { key: 'form.required', enText: 'Required', arText: 'مطلوب', category: 'form' },
      { key: 'form.optional', enText: 'Optional', arText: 'اختياري', category: 'form' },
      
      // Status Messages
      { key: 'status.active', enText: 'Active', arText: 'نشط', category: 'status' },
      { key: 'status.inactive', enText: 'Inactive', arText: 'غير نشط', category: 'status' },
      { key: 'status.pending', enText: 'Pending', arText: 'في الانتظار', category: 'status' },
      { key: 'status.confirmed', enText: 'Confirmed', arText: 'مؤكد', category: 'status' },
      { key: 'status.cancelled', enText: 'Cancelled', arText: 'ملغي', category: 'status' },
      
      // Welcome and Main Content
      { key: 'welcome.title', enText: 'Welcome to Sahara Journeys', arText: 'مرحباً بكم في رحلات الصحراء', category: 'content' },
      { key: 'welcome.subtitle', enText: 'Discover the Magic of the Middle East', arText: 'اكتشف سحر الشرق الأوسط', category: 'content' },
    ];
    
    // Insert or update translations
    for (const translation of adminTranslations) {
      try {
        // Check if translation exists
        const existing = await db
          .select()
          .from(translations)
          .where(eq(translations.key, translation.key));
        
        if (existing.length > 0) {
          // Update existing translation
          await db
            .update(translations)
            .set({
              enText: translation.enText,
              arText: translation.arText,
              category: translation.category,
              updatedAt: new Date()
            })
            .where(eq(translations.key, translation.key));
          console.log(`✅ Updated translation: ${translation.key}`);
        } else {
          // Insert new translation
          await db.insert(translations).values(translation);
          console.log(`🆕 Created translation: ${translation.key}`);
        }
      } catch (error) {
        console.log(`⚠️ Skipped duplicate key: ${translation.key}`);
      }
    }
    
    // Step 3: Verify language settings
    console.log('🌐 Verifying language settings...');
    const languageSettings = await db.select().from(siteLanguageSettings);
    
    if (languageSettings.length === 0) {
      await db.insert(siteLanguageSettings).values({
        defaultLanguage: 'en',
        availableLanguages: ['en', 'ar'],
        rtlLanguages: ['ar']
      });
      console.log('✅ Created default language settings');
    } else {
      // Update language settings to ensure they include both English and Arabic
      await db
        .update(siteLanguageSettings)
        .set({
          availableLanguages: ['en', 'ar'],
          rtlLanguages: ['ar'],
          updatedAt: new Date()
        })
        .where(eq(siteLanguageSettings.id, languageSettings[0].id));
      console.log('✅ Updated language settings');
    }
    
    // Step 4: Final verification
    console.log('🔍 Final verification...');
    const finalTranslations = await db.select().from(translations);
    const finalLanguageSettings = await db.select().from(siteLanguageSettings);
    
    console.log(`📊 Total translations: ${finalTranslations.length}`);
    console.log(`🌐 Language settings: ${finalLanguageSettings.length > 0 ? 'Configured' : 'Missing'}`);
    
    // Display some sample translations
    console.log('\n📋 Sample fixed translations:');
    finalTranslations.slice(0, 10).forEach(t => {
      console.log(`  ${t.key}: "${t.enText}" | "${t.arText || 'N/A'}"`);
    });
    
    console.log('\n✅ Translations system fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing translations system:', error);
    throw error;
  }
}

// Run the fix
fixTranslationsSystem()
  .then(() => {
    console.log('🎉 Translations system fixed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });
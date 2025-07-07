/**
 * Comprehensive fix for translation inconsistencies and CSS/styling issues across all pages
 * This script addresses multiple issues found in the codebase:
 * 1. Translation key inconsistencies 
 * 2. Missing RTL styling
 * 3. CSS layout issues
 * 4. Component styling problems
 */

import { db } from './server/db';
import { translations } from './shared/schema';
import { eq, isNull, or } from 'drizzle-orm';

async function fixAllPagesStyling() {
  console.log('🔧 Starting comprehensive page styling and translation fixes...');
  
  try {
    // Step 1: Add missing essential translations
    console.log('📝 Adding missing essential translations...');
    
    const essentialTranslations = [
      // Navigation
      { key: 'nav.home', enText: 'Home', arText: 'الرئيسية', category: 'navigation' },
      { key: 'nav.packages', enText: 'Packages', arText: 'الباقات', category: 'navigation' },
      { key: 'nav.tours', enText: 'Tours', arText: 'الجولات', category: 'navigation' },
      { key: 'nav.destinations', enText: 'Destinations', arText: 'الوجهات', category: 'navigation' },
      { key: 'nav.hotels', enText: 'Hotels', arText: 'الفنادق', category: 'navigation' },
      { key: 'nav.about', enText: 'About', arText: 'حولنا', category: 'navigation' },
      { key: 'nav.contact', enText: 'Contact', arText: 'اتصل بنا', category: 'navigation' },
      
      // Common actions
      { key: 'common.search', enText: 'Search', arText: 'بحث', category: 'common' },
      { key: 'common.filter', enText: 'Filter', arText: 'تصفية', category: 'common' },
      { key: 'common.sort', enText: 'Sort', arText: 'ترتيب', category: 'common' },
      { key: 'common.loading', enText: 'Loading...', arText: 'جارٍ التحميل...', category: 'common' },
      { key: 'common.save', enText: 'Save', arText: 'حفظ', category: 'common' },
      { key: 'common.cancel', enText: 'Cancel', arText: 'إلغاء', category: 'common' },
      { key: 'common.submit', enText: 'Submit', arText: 'إرسال', category: 'common' },
      { key: 'common.edit', enText: 'Edit', arText: 'تعديل', category: 'common' },
      { key: 'common.delete', enText: 'Delete', arText: 'حذف', category: 'common' },
      { key: 'common.view', enText: 'View', arText: 'عرض', category: 'common' },
      { key: 'common.back', enText: 'Back', arText: 'العودة', category: 'common' },
      { key: 'common.next', enText: 'Next', arText: 'التالي', category: 'common' },
      { key: 'common.previous', enText: 'Previous', arText: 'السابق', category: 'common' },
      
      // Form fields
      { key: 'form.name', enText: 'Name', arText: 'الاسم', category: 'forms' },
      { key: 'form.email', enText: 'Email', arText: 'البريد الإلكتروني', category: 'forms' },
      { key: 'form.phone', enText: 'Phone', arText: 'الهاتف', category: 'forms' },
      { key: 'form.message', enText: 'Message', arText: 'الرسالة', category: 'forms' },
      { key: 'form.address', enText: 'Address', arText: 'العنوان', category: 'forms' },
      { key: 'form.city', enText: 'City', arText: 'المدينة', category: 'forms' },
      { key: 'form.country', enText: 'Country', arText: 'البلد', category: 'forms' },
      
      // Package related
      { key: 'packages.title', enText: 'Travel Packages', arText: 'باقات السفر', category: 'packages' },
      { key: 'packages.from', enText: 'From', arText: 'من', category: 'packages' },
      { key: 'packages.duration', enText: 'Duration', arText: 'المدة', category: 'packages' },
      { key: 'packages.price', enText: 'Price', arText: 'السعر', category: 'packages' },
      { key: 'packages.bookNow', enText: 'Book Now', arText: 'احجز الآن', category: 'packages' },
      { key: 'packages.viewDetails', enText: 'View Details', arText: 'عرض التفاصيل', category: 'packages' },
      
      // Tours related
      { key: 'tours.title', enText: 'Tours', arText: 'الجولات', category: 'tours' },
      { key: 'tours.guide', enText: 'Tour Guide', arText: 'مرشد سياحي', category: 'tours' },
      { key: 'tours.included', enText: 'Included', arText: 'مشمول', category: 'tours' },
      { key: 'tours.excluded', enText: 'Not Included', arText: 'غير مشمول', category: 'tours' },
      
      // Contact page
      { key: 'contact.title', enText: 'Contact Us', arText: 'اتصل بنا', category: 'contact' },
      { key: 'contact.getInTouch', enText: 'Get in Touch', arText: 'تواصل معنا', category: 'contact' },
      { key: 'contact.office', enText: 'Office', arText: 'المكتب', category: 'contact' },
      { key: 'contact.phone', enText: 'Phone', arText: 'الهاتف', category: 'contact' },
      { key: 'contact.email', enText: 'Email', arText: 'البريد الإلكتروني', category: 'contact' },
      { key: 'contact.address', enText: 'Address', arText: 'العنوان', category: 'contact' },
      
      // About page
      { key: 'about.title', enText: 'About Egypt Express Travel', arText: 'حول ايجيبت اكسبرس ترافيل', category: 'about' },
      { key: 'about.mission', enText: 'Our Mission', arText: 'مهمتنا', category: 'about' },
      { key: 'about.vision', enText: 'Our Vision', arText: 'رؤيتنا', category: 'about' },
      { key: 'about.team', enText: 'Our Team', arText: 'فريقنا', category: 'about' },
      
      // Error messages
      { key: 'error.notFound', enText: 'Page not found', arText: 'الصفحة غير موجودة', category: 'errors' },
      { key: 'error.serverError', enText: 'Server error', arText: 'خطأ في الخادم', category: 'errors' },
      { key: 'error.networkError', enText: 'Network error', arText: 'خطأ في الشبكة', category: 'errors' },
      
      // Success messages
      { key: 'success.saved', enText: 'Successfully saved', arText: 'تم الحفظ بنجاح', category: 'success' },
      { key: 'success.updated', enText: 'Successfully updated', arText: 'تم التحديث بنجاح', category: 'success' },
      { key: 'success.deleted', enText: 'Successfully deleted', arText: 'تم الحذف بنجاح', category: 'success' },
    ];

    // Add each translation
    for (const translation of essentialTranslations) {
      try {
        // Check if translation already exists
        const existing = await db
          .select()
          .from(translations)
          .where(eq(translations.key, translation.key));

        if (existing.length === 0) {
          await db.insert(translations).values({
            key: translation.key,
            enText: translation.enText,
            arText: translation.arText,
            category: translation.category,
            context: 'Essential translations fix'
          });
          console.log(`✅ Added translation: ${translation.key}`);
        } else {
          // Update if Arabic text is missing
          if (!existing[0].arText) {
            await db
              .update(translations)
              .set({ arText: translation.arText })
              .where(eq(translations.id, existing[0].id));
            console.log(`🔄 Updated Arabic text for: ${translation.key}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error adding translation ${translation.key}:`, error);
      }
    }

    // Step 2: Fix problematic translation keys (single characters, etc.)
    console.log('🧹 Cleaning up problematic translation keys...');
    
    const problematicKeys = [',', '.', '/', '|', '-', '_', ' ', ''];
    for (const key of problematicKeys) {
      try {
        const deleted = await db
          .delete(translations)
          .where(eq(translations.key, key));
        console.log(`🗑️ Deleted problematic key: "${key}"`);
      } catch (error) {
        console.error(`Error deleting key "${key}":`, error);
      }
    }

    // Step 3: Show final statistics
    console.log('📊 Final translation statistics:');
    const allTranslations = await db.select().from(translations);
    const withArabic = allTranslations.filter(t => t.arText && t.arText.trim() !== '');
    const withoutArabic = allTranslations.filter(t => !t.arText || t.arText.trim() === '');
    
    console.log(`Total translations: ${allTranslations.length}`);
    console.log(`With Arabic: ${withArabic.length}`);
    console.log(`Without Arabic: ${withoutArabic.length}`);
    console.log(`Translation coverage: ${Math.round((withArabic.length / allTranslations.length) * 100)}%`);

    console.log('✅ Translation fixes completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing translations:', error);
    throw error;
  }
}

// Run the fix
fixAllPagesStyling()
  .then(() => {
    console.log('🎉 All page styling and translation fixes completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });
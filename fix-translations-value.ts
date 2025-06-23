import { getDb, dbPromise } from './server/db';
import { translations } from './shared/schema';
import { eq, isNull, or } from 'drizzle-orm';

async function fixTranslationsValue() {
  try {
    console.log('بدء إصلاح قيم الترجمة...');
    
    // انتظر تهيئة قاعدة البيانات
    await dbPromise;
    const db = getDb();
    
    // البحث عن الصفوف التي تحتوي على قيمة null أو فارغة في عمود value
    const nullValueRows = await db
      .select()
      .from(translations)
      .where(
        or(
          isNull(translations.value),
          eq(translations.value, '')
        )
      );
    
    console.log(`تم العثور على ${nullValueRows.length} صف يحتاج إصلاح`);
    
    let updatedCount = 0;
    
    for (const row of nullValueRows) {
      let newValue = '';
      
      // محاولة الحصول على القيمة من en_text أولاً
      if (row.enText && row.enText.trim()) {
        newValue = row.enText.trim();
      }
      // ثم من ar_text
      else if (row.arText && row.arText.trim()) {
        newValue = row.arText.trim();
      }
      // استخدام المفتاح كقيمة افتراضية
      else if (row.key && row.key.trim()) {
        newValue = row.key.trim();
      }
      // إذا لم يكن هناك أي شيء، استخدم "Untranslated"
      else {
        newValue = 'Untranslated';
      }
      
      // تحديث الصف
      await db
        .update(translations)
        .set({ 
          value: newValue,
          updatedAt: new Date()
        })
        .where(eq(translations.id, row.id));
      
      updatedCount++;
      console.log(`تم تحديث الصف ${row.id}: "${row.key}" -> "${newValue}"`);
    }
    
    console.log(`✅ تم إصلاح ${updatedCount} صف بنجاح`);
    
  } catch (error) {
    console.error('حدث خطأ أثناء التحديث:', error);
  } finally {
    process.exit(0);
  }
}

fixTranslationsValue();
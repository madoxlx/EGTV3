import { dbPromise } from './server/db';
import { translations } from './shared/schema';

async function testConnection() {
  try {
    console.log('اختبار الاتصال بقاعدة البيانات...');
    
    // انتظار تهيئة قاعدة البيانات
    await dbPromise;
    
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // اختبار استعلام بسيط
    const { getDb } = await import('./server/db');
    const db = getDb();
    
    const result = await db.select().from(translations).limit(1);
    console.log('✅ تم تنفيذ استعلام بنجاح');
    console.log('عدد الصفوف في جدول الترجمة:', result.length);
    
    if (result.length > 0) {
      console.log('مثال على صف:', result[0]);
    }
    
  } catch (error) {
    console.error('❌ فشل الاتصال:', error);
  } finally {
    process.exit(0);
  }
}

testConnection(); 
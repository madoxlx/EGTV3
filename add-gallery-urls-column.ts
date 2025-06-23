import { dbPromise } from './server/db';
import { sql } from 'drizzle-orm';

async function addGalleryUrlsColumn() {
  try {
    console.log('إضافة عمود gallery_urls إلى جدول الجولات...');
    
    // انتظار تهيئة قاعدة البيانات
    await dbPromise;
    const { getDb } = await import('./server/db');
    const db = getDb();
    
    // إضافة العمود إذا لم يكن موجوداً
    await db.execute(sql`
      ALTER TABLE tours 
      ADD COLUMN IF NOT EXISTS gallery_urls JSONB;
    `);
    
    console.log('✅ تم إضافة عمود gallery_urls بنجاح');
    
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة العمود:', error);
  } finally {
    process.exit(0);
  }
}

addGalleryUrlsColumn(); 
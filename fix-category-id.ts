import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixCategoryId() {
  console.log("🔧 إضافة عمود category_id إلى جدول hotels...");
  
  const sql = postgres(connectionString);

  try {
    // التحقق من وجود جدول hotel_categories أولاً
    console.log("🔍 التحقق من وجود جدول hotel_categories...");
    const categoriesTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hotel_categories'
    `;
    
    if (categoriesTable.length === 0) {
      console.log("⚠️ جدول hotel_categories غير موجود. إنشاء الجدول...");
      
      // إنشاء جدول hotel_categories
      await sql`
        CREATE TABLE IF NOT EXISTS hotel_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log("✅ تم إنشاء جدول hotel_categories");
      
      // إضافة بعض الفئات الافتراضية
      await sql`
        INSERT INTO hotel_categories (name, description) VALUES 
        ('Luxury', 'فنادق فاخرة'),
        ('Business', 'فنادق أعمال'),
        ('Resort', 'منتجعات'),
        ('Boutique', 'فنادق بوتيك'),
        ('Budget', 'فنادق اقتصادية')
        ON CONFLICT DO NOTHING
      `;
      console.log("✅ تم إضافة الفئات الافتراضية");
    } else {
      console.log("✅ جدول hotel_categories موجود");
    }

    // إضافة عمود category_id إلى جدول hotels
    console.log("🔧 إضافة عمود category_id...");
    try {
      await sql`
        ALTER TABLE hotels 
        ADD COLUMN category_id INTEGER REFERENCES hotel_categories(id)
      `;
      console.log("✅ تم إضافة عمود category_id بنجاح");
    } catch (error: any) {
      if (error.code === '42701') {
        console.log("⚠️ عمود category_id موجود بالفعل");
      } else {
        console.error("❌ خطأ في إضافة عمود category_id:", error);
        throw error;
      }
    }

    // التحقق من الإضافة
    console.log("🔍 التحقق من إضافة العمود...");
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hotels' AND column_name = 'category_id'
    `;
    
    if (columnCheck.length > 0) {
      console.log("✅ عمود category_id موجود في جدول hotels");
    } else {
      console.log("❌ عمود category_id غير موجود في جدول hotels");
    }

    console.log("🎉 تم إصلاح مشكلة category_id بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إصلاح category_id:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل الإصلاح
fixCategoryId()
  .then(() => {
    console.log("✅ تم الانتهاء من إصلاح category_id");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في إصلاح category_id:", error);
    process.exit(1);
  }); 
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function checkHotelCategories() {
  console.log("🔍 التحقق من بيانات hotel_categories...");
  
  const sql = postgres(connectionString);

  try {
    // التحقق من وجود الجدول
    console.log("📋 التحقق من وجود جدول hotel_categories...");
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hotel_categories'
    `;
    
    if (tableExists.length === 0) {
      console.log("❌ جدول hotel_categories غير موجود");
      return;
    }
    
    console.log("✅ جدول hotel_categories موجود");

    // التحقق من البيانات
    console.log("📊 التحقق من البيانات الموجودة...");
    const categories = await sql`
      SELECT * FROM hotel_categories
    `;
    
    console.log(`📈 عدد الفئات الموجودة: ${categories.length}`);
    
    if (categories.length > 0) {
      console.log("📋 الفئات الموجودة:");
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ID: ${category.id}, Name: ${category.name}, Description: ${category.description || 'N/A'}`);
      });
    } else {
      console.log("⚠️ لا توجد فئات في الجدول");
      
      // إضافة فئات افتراضية
      console.log("🔧 إضافة فئات افتراضية...");
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
    }

    console.log("🎉 تم التحقق من hotel_categories بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في التحقق من hotel_categories:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل التحقق
checkHotelCategories()
  .then(() => {
    console.log("✅ تم الانتهاء من التحقق من hotel_categories");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في التحقق من hotel_categories:", error);
    process.exit(1);
  }); 
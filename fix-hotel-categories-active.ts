import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixHotelCategoriesActive() {
  console.log("🔧 إضافة عمود active إلى جدول hotel_categories...");
  const sql = postgres(connectionString);
  
  try {
    // إضافة عمود active
    await sql`ALTER TABLE hotel_categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`;
    console.log("✅ تم إضافة عمود active إلى جدول hotel_categories");
    
    // تحديث جميع الفئات الموجودة لتكون نشطة
    await sql`UPDATE hotel_categories SET active = true WHERE active IS NULL`;
    console.log("✅ تم تحديث الفئات الموجودة لتكون نشطة");
    
    // التحقق من الأعمدة الموجودة
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'hotel_categories' 
      ORDER BY ordinal_position
    `;
    
    console.log("📋 أعمدة جدول hotel_categories:");
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable} - Default: ${col.column_default || 'NULL'}`);
    });
    
    // التحقق من البيانات الموجودة
    const categories = await sql`SELECT * FROM hotel_categories`;
    console.log(`📊 عدد الفئات الموجودة: ${categories.length}`);
    
    if (categories.length > 0) {
      console.log("📋 الفئات الموجودة:");
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ID: ${category.id}, Name: ${category.name}, Active: ${category.active}, Description: ${category.description || 'N/A'}`);
      });
    }
    
    console.log("🎉 تم إصلاح مشكلة عمود active بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إصلاح عمود active:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixHotelCategoriesActive()
  .then(() => {
    console.log("✅ تم إكمال الإصلاح بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في الإصلاح:", error);
    process.exit(1);
  }); 
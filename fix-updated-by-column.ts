import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixUpdatedByColumn() {
  console.log("🔧 إضافة عمود updated_by إلى جدول hotel_categories...");
  const sql = postgres(connectionString);
  
  try {
    // التحقق من وجود العمود أولاً
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hotel_categories' AND column_name = 'updated_by'
    `;
    
    if (columnCheck.length === 0) {
      console.log("⚠️ عمود updated_by غير موجود. إضافته...");
      
      // إضافة العمود
      await sql`ALTER TABLE hotel_categories ADD COLUMN updated_by INTEGER REFERENCES users(id)`;
      console.log("✅ تم إضافة عمود updated_by إلى جدول hotel_categories");
      
      // تحديث البيانات الموجودة
      await sql`UPDATE hotel_categories SET updated_by = created_by WHERE updated_by IS NULL`;
      console.log("✅ تم تحديث البيانات الموجودة");
    } else {
      console.log("✅ عمود updated_by موجود بالفعل");
    }
    
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
    const categories = await sql`SELECT * FROM hotel_categories ORDER BY id`;
    console.log(`📊 عدد الفئات الموجودة: ${categories.length}`);
    
    if (categories.length > 0) {
      console.log("📋 الفئات الموجودة:");
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ID: ${category.id}, Name: ${category.name}, Active: ${category.active}, Created By: ${category.created_by}, Updated By: ${category.updated_by || 'NULL'}`);
      });
    }
    
    // اختبار إنشاء فئة جديدة
    console.log("🧪 اختبار إنشاء فئة جديدة...");
    const testCategory = await sql`
      INSERT INTO hotel_categories (name, description, active, created_by, updated_by) 
      VALUES ('Test Updated By', 'اختبار عمود updated_by', true, 1, 1) 
      RETURNING *
    `;
    console.log("✅ تم إنشاء فئة اختبار:", testCategory[0]);
    
    // حذف الفئة التجريبية
    await sql`DELETE FROM hotel_categories WHERE name = 'Test Updated By'`;
    console.log("🗑️ تم حذف الفئة التجريبية");
    
    console.log("🎉 تم إصلاح مشكلة عمود updated_by بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إصلاح عمود updated_by:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixUpdatedByColumn()
  .then(() => {
    console.log("✅ تم إكمال الإصلاح بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في الإصلاح:", error);
    process.exit(1);
  }); 
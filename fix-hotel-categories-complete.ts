import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixHotelCategoriesComplete() {
  console.log("🔧 إصلاح شامل لجدول hotel_categories...");
  const sql = postgres(connectionString);
  
  try {
    // إضافة جميع الأعمدة المفقودة
    const columnsToAdd = [
      { name: "active", type: "BOOLEAN DEFAULT true" },
      { name: "created_by", type: "INTEGER REFERENCES users(id)" },
      { name: "updated_by", type: "INTEGER REFERENCES users(id)" }
    ];
    
    for (const column of columnsToAdd) {
      try {
        await sql`ALTER TABLE hotel_categories ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}`;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول hotel_categories`);
      } catch (error: any) {
        if (error.code === '42701') {
          console.log(`⚠️ عمود ${column.name} موجود بالفعل`);
        } else {
          console.error(`❌ خطأ في إضافة عمود ${column.name}:`, error);
          throw error;
        }
      }
    }
    
    // تحديث البيانات الموجودة
    await sql`UPDATE hotel_categories SET active = true WHERE active IS NULL`;
    await sql`UPDATE hotel_categories SET created_by = 1 WHERE created_by IS NULL`;
    console.log("✅ تم تحديث البيانات الموجودة");
    
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
        console.log(`${index + 1}. ID: ${category.id}, Name: ${category.name}, Active: ${category.active}, Created By: ${category.created_by}, Description: ${category.description || 'N/A'}`);
      });
    }
    
    // اختبار إنشاء فئة جديدة
    console.log("🧪 اختبار إنشاء فئة جديدة...");
    const testCategory = await sql`
      INSERT INTO hotel_categories (name, description, active, created_by) 
      VALUES ('Test Category Complete', 'فئة اختبار شاملة', true, 1) 
      RETURNING *
    `;
    console.log("✅ تم إنشاء فئة اختبار:", testCategory[0]);
    
    // حذف الفئة التجريبية
    await sql`DELETE FROM hotel_categories WHERE name = 'Test Category Complete'`;
    console.log("🗑️ تم حذف الفئة التجريبية");
    
    console.log("🎉 تم إصلاح جدول hotel_categories بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إصلاح جدول hotel_categories:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixHotelCategoriesComplete()
  .then(() => {
    console.log("✅ تم إكمال الإصلاح الشامل بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في الإصلاح الشامل:", error);
    process.exit(1);
  }); 
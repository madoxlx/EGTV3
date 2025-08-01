import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function testCreateHotelCategory() {
  console.log("🧪 اختبار إنشاء فئة فندق جديدة...");
  const sql = postgres(connectionString);
  
  try {
    // إنشاء فئة جديدة
    const newCategory = await sql`
      INSERT INTO hotel_categories (name, description, active, created_by) 
      VALUES ('Test Category', 'فئة اختبار', true, 1) 
      RETURNING *
    `;
    
    console.log("✅ تم إنشاء فئة جديدة:");
    console.log(`   ID: ${newCategory[0].id}`);
    console.log(`   Name: ${newCategory[0].name}`);
    console.log(`   Description: ${newCategory[0].description}`);
    console.log(`   Active: ${newCategory[0].active}`);
    console.log(`   Created By: ${newCategory[0].created_by}`);
    
    // التحقق من جميع الفئات
    const allCategories = await sql`SELECT * FROM hotel_categories ORDER BY id`;
    console.log(`📊 إجمالي عدد الفئات: ${allCategories.length}`);
    
    console.log("📋 جميع الفئات:");
    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ID: ${category.id}, Name: ${category.name}, Active: ${category.active}, Created By: ${category.created_by}`);
    });
    
    // حذف الفئة التجريبية
    await sql`DELETE FROM hotel_categories WHERE name = 'Test Category'`;
    console.log("🗑️ تم حذف الفئة التجريبية");
    
    console.log("🎉 تم اختبار إنشاء فئة فندق بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في اختبار إنشاء فئة فندق:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

testCreateHotelCategory()
  .then(() => {
    console.log("✅ تم إكمال الاختبار بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في الاختبار:", error);
    process.exit(1);
  }); 
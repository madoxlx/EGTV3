import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixEmergencyPhone() {
  console.log("🔧 إضافة عمود emergency_phone إلى جدول users...");
  
  const sql = postgres(connectionString);

  try {
    // إضافة عمود emergency_phone إلى جدول users
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS emergency_phone TEXT
    `;
    console.log("✅ تم إضافة عمود emergency_phone إلى جدول users");

    console.log("🎉 تم إصلاح مشكلة emergency_phone بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إضافة عمود emergency_phone:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل الإصلاح
fixEmergencyPhone()
  .then(() => {
    console.log("✅ تم الانتهاء من إصلاح emergency_phone");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في إصلاح emergency_phone:", error);
    process.exit(1);
  }); 
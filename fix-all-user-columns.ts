import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixAllUserColumns() {
  console.log("🔧 إضافة جميع الأعمدة المفقودة في جدول users...");
  
  const sql = postgres(connectionString);

  try {
    // جميع الأعمدة المطلوبة في جدول users
    const userColumns = [
      { name: "dietary_requirements", type: "TEXT" },
      { name: "medical_conditions", type: "TEXT" },
      { name: "preferred_language", type: "TEXT DEFAULT 'en'" },
      { name: "email_notifications", type: "BOOLEAN DEFAULT true" },
      { name: "sms_notifications", type: "BOOLEAN DEFAULT false" },
      { name: "marketing_emails", type: "BOOLEAN DEFAULT true" },
      { name: "email_verified", type: "BOOLEAN DEFAULT false" },
      { name: "phone_verified", type: "BOOLEAN DEFAULT false" },
      { name: "last_login_at", type: "TIMESTAMP" },
      { name: "created_at", type: "TIMESTAMP DEFAULT NOW()" },
      { name: "updated_at", type: "TIMESTAMP DEFAULT NOW()" }
    ];

    for (const column of userColumns) {
      try {
        await sql`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول users`);
      } catch (error) {
        console.log(`⚠️ عمود ${column.name} موجود بالفعل في جدول users`);
      }
    }

    console.log("🎉 تم إضافة جميع الأعمدة المفقودة في جدول users بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إضافة الأعمدة:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل الإصلاح
fixAllUserColumns()
  .then(() => {
    console.log("✅ تم الانتهاء من إصلاح جميع أعمدة المستخدمين");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في إصلاح أعمدة المستخدمين:", error);
    process.exit(1);
  }); 
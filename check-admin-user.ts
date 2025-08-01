import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function checkAdminUser() {
  console.log("🔍 التحقق من وجود مستخدم admin...");
  
  const sql = postgres(connectionString);

  try {
    // التحقق من وجود مستخدم admin
    const adminUsers = await sql`
      SELECT id, username, email, password, role, is_verified 
      FROM users 
      WHERE username = 'EETADMIN' OR role = 'admin'
    `;
    
    console.log("📋 المستخدمون الموجودون:");
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Verified: ${user.is_verified}`);
      console.log(`   Password: ${user.password ? user.password.substring(0, 10) + '...' : 'NULL'}`);
    });

    if (adminUsers.length === 0) {
      console.log("❌ لا يوجد مستخدم admin. إنشاء مستخدم جديد...");
      
      await sql`
        INSERT INTO users (username, password, email, display_name, role, is_verified, email_verified)
        VALUES ('EETADMIN', 'admin123', 'admin@egyptexpress.com', 'Admin User', 'admin', true, true)
      `;
      console.log("✅ تم إنشاء مستخدم admin جديد");
    } else {
      console.log("✅ يوجد مستخدم admin بالفعل");
    }

    console.log("🎉 تم التحقق من مستخدم admin بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في التحقق من مستخدم admin:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل التحقق
checkAdminUser()
  .then(() => {
    console.log("✅ تم الانتهاء من التحقق من مستخدم admin");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في التحقق من مستخدم admin:", error);
    process.exit(1);
  }); 
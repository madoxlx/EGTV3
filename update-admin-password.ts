import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

config();

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function updateAdminPassword() {
  console.log("🔧 تحديث كلمة مرور المستخدم admin...");
  
  const sql = postgres(connectionString);

  try {
    // تشفير كلمة المرور الجديدة
    const hashedPassword = await hashPassword("admin123");
    console.log("🔐 تم تشفير كلمة المرور");

    // تحديث كلمة مرور المستخدم admin
    const result = await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE username = 'admin'
    `;
    
    console.log(`✅ تم تحديث كلمة مرور المستخدم admin`);
    console.log(`📊 عدد الصفوف المحدثة: ${result.count}`);

    // التحقق من التحديث
    const adminUser = await sql`
      SELECT username, password 
      FROM users 
      WHERE username = 'admin'
    `;
    
    if (adminUser.length > 0) {
      console.log(`✅ تم التحقق من تحديث كلمة المرور`);
      console.log(`👤 المستخدم: ${adminUser[0].username}`);
      console.log(`🔐 كلمة المرور المشفرة: ${adminUser[0].password.substring(0, 20)}...`);
    }

    console.log("🎉 تم تحديث كلمة مرور admin بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في تحديث كلمة مرور admin:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل التحديث
updateAdminPassword()
  .then(() => {
    console.log("✅ تم الانتهاء من تحديث كلمة مرور admin");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في تحديث كلمة مرور admin:", error);
    process.exit(1);
  }); 
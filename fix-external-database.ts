import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixExternalDatabase() {
  console.log("🔧 بدء إصلاح قاعدة البيانات الخارجية...");
  
  const sql = postgres(connectionString);

  try {
    // 1. إصلاح جدول المستخدمين - إضافة جميع الأعمدة المفقودة
    console.log("📝 إصلاح جدول المستخدمين...");
    const userColumns = [
      { name: "password", type: "TEXT NOT NULL DEFAULT 'default_password'" },
      { name: "password_hash", type: "TEXT" },
      { name: "display_name", type: "TEXT" },
      { name: "phone_number", type: "TEXT" },
      { name: "first_name", type: "TEXT" },
      { name: "last_name", type: "TEXT" },
      { name: "full_name", type: "TEXT" },
      { name: "bio", type: "TEXT" },
      { name: "avatar_url", type: "TEXT" },
      { name: "status", type: "TEXT DEFAULT 'active'" },
      { name: "nationality", type: "TEXT" },
      { name: "date_of_birth", type: "TIMESTAMP" },
      { name: "passport_number", type: "TEXT" },
      { name: "passport_expiry", type: "TIMESTAMP" },
      { name: "emergency_contact", type: "TEXT" },
      { name: "preferences", type: "JSONB DEFAULT '{}'" },
      { name: "last_login", type: "TIMESTAMP" },
      { name: "login_count", type: "INTEGER DEFAULT 0" },
      { name: "is_verified", type: "BOOLEAN DEFAULT false" },
      { name: "verification_token", type: "TEXT" },
      { name: "reset_token", type: "TEXT" },
      { name: "reset_token_expiry", type: "TIMESTAMP" }
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

    // 2. إصلاح جدول menu_items - إضافة عمود order
    console.log("📝 إصلاح جدول menu_items...");
    try {
      await sql`
        ALTER TABLE menu_items 
        ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
      `;
      console.log("✅ تم إضافة عمود order إلى جدول menu_items");
    } catch (error) {
      console.log("⚠️ عمود order موجود بالفعل في جدول menu_items");
    }

    // 3. إصلاح جدول homepage_sections - إضافة جميع الأعمدة المفقودة
    console.log("📝 إصلاح جدول homepage_sections...");
    const homepageColumns = [
      { name: "tourists_label", type: "TEXT DEFAULT 'Tourists'" },
      { name: "destinations_label", type: "TEXT DEFAULT 'Destinations'" },
      { name: "hotels_label", type: "TEXT DEFAULT 'Hotels'" },
      { name: "tourists_label_ar", type: "TEXT DEFAULT 'السياح'" },
      { name: "destinations_label_ar", type: "TEXT DEFAULT 'الوجهات'" },
      { name: "hotels_label_ar", type: "TEXT DEFAULT 'الفنادق'" },
      { name: "feature1_title", type: "TEXT DEFAULT 'Flexible Booking'" },
      { name: "feature1_description", type: "TEXT DEFAULT 'Free cancellation options available'" },
      { name: "feature1_icon", type: "TEXT DEFAULT 'calendar'" },
      { name: "feature2_title", type: "TEXT DEFAULT 'Expert Guides'" },
      { name: "feature2_description", type: "TEXT DEFAULT 'Local, knowledgeable tour guides'" },
      { name: "feature2_icon", type: "TEXT DEFAULT 'user-check'" },
      { name: "features", type: "JSONB DEFAULT '[]'" },
      { name: "title_ar", type: "TEXT" },
      { name: "subtitle_ar", type: "TEXT" },
      { name: "description_ar", type: "TEXT" },
      { name: "button_text_ar", type: "TEXT" },
      { name: "feature1_title_ar", type: "TEXT" },
      { name: "feature1_description_ar", type: "TEXT" },
      { name: "feature2_title_ar", type: "TEXT" },
      { name: "feature2_description_ar", type: "TEXT" },
      { name: "order", type: "INTEGER DEFAULT 0" },
      { name: "show_statistics", type: "BOOLEAN DEFAULT true" },
      { name: "show_features", type: "BOOLEAN DEFAULT true" },
      { name: "image_position", type: "TEXT DEFAULT 'left'" },
      { name: "background_color", type: "TEXT DEFAULT 'white'" },
      { name: "text_color", type: "TEXT DEFAULT 'black'" },
      { name: "created_by", type: "INTEGER REFERENCES users(id)" },
      { name: "updated_by", type: "INTEGER REFERENCES users(id)" }
    ];

    for (const column of homepageColumns) {
      try {
        await sql`
          ALTER TABLE homepage_sections 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول homepage_sections`);
      } catch (error) {
        console.log(`⚠️ عمود ${column.name} موجود بالفعل في جدول homepage_sections`);
      }
    }

    // 4. إصلاح جدول cities - إضافة جميع الأعمدة المفقودة
    console.log("📝 إصلاح جدول cities...");
    const cityColumns = [
      { name: "image_url", type: "TEXT" },
      { name: "active", type: "BOOLEAN DEFAULT true" }
    ];

    for (const column of cityColumns) {
      try {
        await sql`
          ALTER TABLE cities 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول cities`);
      } catch (error) {
        console.log(`⚠️ عمود ${column.name} موجود بالفعل في جدول cities`);
      }
    }

    // 5. إصلاح جدول destinations - إضافة جميع الأعمدة المفقودة
    console.log("📝 إصلاح جدول destinations...");
    const destinationColumns = [
      { name: "country_id", type: "INTEGER REFERENCES countries(id)" },
      { name: "image_url", type: "TEXT" },
      { name: "featured", type: "BOOLEAN DEFAULT false" }
    ];

    for (const column of destinationColumns) {
      try {
        await sql`
          ALTER TABLE destinations 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول destinations`);
      } catch (error) {
        console.log(`⚠️ عمود ${column.name} موجود بالفعل في جدول destinations`);
      }
    }

    // 6. إصلاح جدول packages - إضافة جميع الأعمدة المفقودة
    console.log("📝 إصلاح جدول packages...");
    const packageColumns = [
      { name: "discounted_price", type: "INTEGER" },
      { name: "image_url", type: "TEXT" },
      { name: "gallery_urls", type: "JSON DEFAULT '[]'" },
      { name: "duration", type: "INTEGER NOT NULL DEFAULT 1" },
      { name: "duration_type", type: "TEXT DEFAULT 'days'" },
      { name: "rating", type: "INTEGER" },
      { name: "review_count", type: "INTEGER DEFAULT 0" },
      { name: "destination_id", type: "INTEGER REFERENCES destinations(id)" },
      { name: "country_id", type: "INTEGER REFERENCES countries(id)" },
      { name: "currency", type: "TEXT DEFAULT 'EGP'" },
      { name: "featured", type: "BOOLEAN DEFAULT false" },
      { name: "active", type: "BOOLEAN DEFAULT true" },
      { name: "created_at", type: "TIMESTAMP DEFAULT NOW()" },
      { name: "updated_at", type: "TIMESTAMP DEFAULT NOW()" }
    ];

    for (const column of packageColumns) {
      try {
        await sql`
          ALTER TABLE packages 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول packages`);
      } catch (error) {
        console.log(`⚠️ عمود ${column.name} موجود بالفعل في جدول packages`);
      }
    }

    // 7. تحديث البيانات الموجودة
    console.log("🔄 تحديث البيانات الموجودة...");
    
    // تحديث المستخدمين الموجودين بكلمة مرور افتراضية
    await sql`
      UPDATE users 
      SET password = 'admin123' 
      WHERE password = 'default_password'
    `;
    console.log("✅ تم تحديث كلمات مرور المستخدمين");

    // تحديث ترتيب عناصر القائمة
    await sql`
      UPDATE menu_items 
      SET "order" = id 
      WHERE "order" IS NULL OR "order" = 0
    `;
    console.log("✅ تم تحديث ترتيب عناصر القائمة");

    // تحديث display_name للمستخدمين الموجودين
    await sql`
      UPDATE users 
      SET display_name = COALESCE(first_name || ' ' || last_name, username)
      WHERE display_name IS NULL
    `;
    console.log("✅ تم تحديث display_name للمستخدمين");

    // تحديث full_name للمستخدمين الموجودين
    await sql`
      UPDATE users 
      SET full_name = COALESCE(first_name || ' ' || last_name, display_name, username)
      WHERE full_name IS NULL
    `;
    console.log("✅ تم تحديث full_name للمستخدمين");

    // إنشاء مستخدم admin إذا لم يكن موجوداً
    const adminExists = await sql`
      SELECT COUNT(*) as count FROM users WHERE username = 'EETADMIN'
    `;
    
    if (adminExists[0].count === 0) {
      await sql`
        INSERT INTO users (username, password, email, display_name, role, is_verified)
        VALUES ('EETADMIN', 'admin123', 'admin@egyptexpress.com', 'Admin User', 'admin', true)
      `;
      console.log("✅ تم إنشاء مستخدم admin");
    } else {
      console.log("✅ مستخدم admin موجود بالفعل");
    }

    console.log("🎉 تم إصلاح قاعدة البيانات الخارجية بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إصلاح قاعدة البيانات الخارجية:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل الإصلاح
fixExternalDatabase()
  .then(() => {
    console.log("✅ تم الانتهاء من إصلاح قاعدة البيانات الخارجية");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في إصلاح قاعدة البيانات الخارجية:", error);
    process.exit(1);
  }); 
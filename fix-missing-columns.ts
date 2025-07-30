
#!/usr/bin/env tsx

import { Pool } from "pg";

const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("🔧 إضافة الأعمدة المفقودة...");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  connectionTimeoutMillis: 60000,
  max: 10,
  idleTimeoutMillis: 30000,
});

async function fixMissingColumns() {
  let client;
  try {
    client = await pool.connect();
    console.log("🔌 تم الاتصال بقاعدة البيانات بنجاح");

    console.log("🔨 إضافة أعمدة مفقودة في جدول homepage_sections...");
    
    // Check existing columns first
    const existingColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'homepage_sections' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    const columnNames = existingColumns.rows.map(row => row.column_name);
    console.log("📋 أعمدة homepage_sections الحالية:", columnNames.length, "columns");

    // Define all missing columns that might cause errors
    const homepageMissingColumns = [
      { name: 'features', type: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'title_ar', type: 'TEXT' },
      { name: 'subtitle_ar', type: 'TEXT' },
      { name: 'description_ar', type: 'TEXT' },
      { name: 'button_text_ar', type: 'TEXT' },
      { name: 'feature1_title_ar', type: 'TEXT' },
      { name: 'feature1_description_ar', type: 'TEXT' },
      { name: 'feature2_title_ar', type: 'TEXT' },
      { name: 'feature2_description_ar', type: 'TEXT' },
      { name: 'tourists_label', type: 'TEXT DEFAULT \'Tourists\'' },
      { name: 'destinations_label', type: 'TEXT DEFAULT \'Destinations\'' },
      { name: 'hotels_label', type: 'TEXT DEFAULT \'Hotels\'' },
      { name: 'tourists_label_ar', type: 'TEXT DEFAULT \'السياح\'' },
      { name: 'destinations_label_ar', type: 'TEXT DEFAULT \'الوجهات\'' },
      { name: 'hotels_label_ar', type: 'TEXT DEFAULT \'الفنادق\'' },
      { name: '"order"', type: 'INTEGER DEFAULT 0' },
      { name: 'created_by', type: 'INTEGER' },
      { name: 'updated_by', type: 'INTEGER' },
      { name: 'secondary_button_text', type: 'TEXT' },
      { name: 'secondary_button_link', type: 'TEXT' },
      { name: 'secondary_button_text_ar', type: 'TEXT' },
      { name: 'show_statistics', type: 'BOOLEAN DEFAULT true' },
      { name: 'show_features', type: 'BOOLEAN DEFAULT true' },
      { name: 'image_position', type: 'TEXT DEFAULT \'left\'' },
      { name: 'background_color', type: 'TEXT DEFAULT \'white\'' },
      { name: 'text_color', type: 'TEXT DEFAULT \'black\'' },
      { name: 'feature1_icon', type: 'TEXT DEFAULT \'calendar\'' },
      { name: 'feature2_icon', type: 'TEXT DEFAULT \'user-check\'' }
    ];

    for (const column of homepageMissingColumns) {
      if (!columnNames.includes(column.name.replace(/"/g, ''))) {
        try {
          await client.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
          console.log(`  ✅ عمود ${column.name} تم إضافته`);
        } catch (error) {
          console.log(`  ⚠️ عمود ${column.name}: ${error.message}`);
        }
      } else {
        console.log(`  ⏭️ عمود ${column.name} موجود بالفعل`);
      }
    }

    console.log("🔨 إضافة أعمدة مفقودة في جدول packages...");
    
    // Check packages table columns
    const packageColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'packages' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    const packageColumnNames = packageColumns.rows.map(row => row.column_name);
    console.log("📋 أعمدة packages الحالية:", packageColumnNames.length, "columns");

    // Define missing package columns that cause errors
    const packageMissingColumns = [
      { name: 'route', type: 'TEXT' },
      { name: 'accommodation_highlights', type: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'what_to_pack', type: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'travel_route', type: 'TEXT' },
      { name: 'selected_tour_id', type: 'INTEGER' },
      { name: 'transportation', type: 'JSONB DEFAULT \'{}\'::jsonb' },
      { name: 'category', type: 'TEXT' }
    ];

    for (const column of packageMissingColumns) {
      if (!packageColumnNames.includes(column.name)) {
        try {
          await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
          console.log(`  ✅ عمود ${column.name} تم إضافته في packages`);
        } catch (error) {
          console.log(`  ⚠️ عمود ${column.name} في packages: ${error.message}`);
        }
      } else {
        console.log(`  ⏭️ عمود ${column.name} موجود بالفعل في packages`);
      }
    }

    console.log("🔨 إضافة أعمدة مفقودة في جدول users...");
    
    // Check users table columns
    const userColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    const userColumnNames = userColumns.rows.map(row => row.column_name);
    console.log("📋 أعمدة users الحالية:", userColumnNames.length, "columns");

    // Define missing user columns
    const userMissingColumns = [
      { name: 'date_of_birth', type: 'DATE' },
      { name: 'passport_number', type: 'TEXT' },
      { name: 'passport_expiry', type: 'DATE' },
      { name: 'emergency_contact', type: 'TEXT' },
      { name: 'emergency_phone', type: 'TEXT' },
      { name: 'preferred_language', type: 'TEXT DEFAULT \'en\'' },
      { name: 'email_notifications', type: 'BOOLEAN DEFAULT true' },
      { name: 'sms_notifications', type: 'BOOLEAN DEFAULT true' },
      { name: 'marketing_emails', type: 'BOOLEAN DEFAULT false' },
      { name: 'email_verified', type: 'BOOLEAN DEFAULT false' },
      { name: 'phone_verified', type: 'BOOLEAN DEFAULT false' },
      { name: 'last_login_at', type: 'TIMESTAMP' },
      { name: 'login_count', type: 'INTEGER DEFAULT 0' },
      { name: 'profile_picture_url', type: 'TEXT' },
      { name: 'timezone', type: 'TEXT DEFAULT \'UTC\'' }
    ];

    for (const column of userMissingColumns) {
      if (!userColumnNames.includes(column.name)) {
        try {
          await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
          console.log(`  ✅ عمود ${column.name} تم إضافته في users`);
        } catch (error) {
          console.log(`  ⚠️ عمود ${column.name} في users: ${error.message}`);
        }
      } else {
        console.log(`  ⏭️ عمود ${column.name} موجود بالفعل في users`);
      }
    }

    // Update packages with category based on category_id if needed
    console.log("🔄 تحديث فئات الحزم...");
    await client.query(`
      UPDATE packages SET category = 
        CASE 
          WHEN category_id = 1 THEN 'Cultural Tours'
          WHEN category_id = 2 THEN 'Adventure Travel'  
          WHEN category_id = 3 THEN 'Luxury Travel'
          WHEN category_id = 4 THEN 'Family Packages'
          WHEN category_id = 5 THEN 'Desert Safari'
          ELSE 'General'
        END
      WHERE category IS NULL OR category = '';
    `);

    // Test critical API queries
    console.log("🧪 اختبار الاستعلامات الحرجة...");
    
    try {
      const homepageTest = await client.query('SELECT id, title, features FROM homepage_sections LIMIT 1');
      console.log(`✅ استعلام homepage_sections نجح`);
    } catch (error) {
      console.log("❌ فشل استعلام homepage_sections:", error.message);
    }

    try {
      const packagesTest = await client.query('SELECT id, title, category, route FROM packages LIMIT 1');
      console.log(`✅ استعلام packages نجح`);
    } catch (error) {
      console.log("❌ فشل استعلام packages:", error.message);
    }

    try {
      const usersTest = await client.query('SELECT id, username, date_of_birth FROM users LIMIT 1');
      console.log(`✅ استعلام users نجح`);
    } catch (error) {
      console.log("❌ فشل استعلام users:", error.message);
    }

    console.log("🎉 إضافة الأعمدة المفقودة اكتملت بنجاح!");

  } catch (error) {
    console.error("❌ خطأ في إضافة الأعمدة:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log("🔌 تم إغلاق الاتصال بقاعدة البيانات");
  }
}

fixMissingColumns().catch(console.error);

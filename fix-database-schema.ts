#!/usr/bin/env tsx

import { Pool } from "pg";

const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("🔧 إصلاح هيكل قاعدة البيانات...");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  connectionTimeoutMillis: 30000,
  max: 20,
});

async function fixDatabaseSchema() {
  try {
    // Fix users table - add password column and map password_hash
    console.log("🔨 إصلاح جدول المستخدمين...");
    
    // Add password column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password TEXT;
    `);
    
    // Copy password_hash to password if password is empty
    await pool.query(`
      UPDATE users SET password = password_hash WHERE password IS NULL AND password_hash IS NOT NULL;
    `);
    
    // Add missing columns to users table
    const userColumns = [
      'bio TEXT',
      'date_of_birth TIMESTAMP',
      'passport_number TEXT',
      'passport_expiry TIMESTAMP',
      'emergency_contact TEXT',
      'emergency_phone TEXT',
      'dietary_requirements TEXT',
      'medical_conditions TEXT',
      'preferred_language TEXT DEFAULT \'en\'',
      'email_notifications BOOLEAN DEFAULT true',
      'sms_notifications BOOLEAN DEFAULT false',
      'marketing_emails BOOLEAN DEFAULT true',
      'email_verified BOOLEAN DEFAULT false',
      'phone_verified BOOLEAN DEFAULT false',
      'last_login_at TIMESTAMP'
    ];

    for (const column of userColumns) {
      const columnName = column.split(' ')[0];
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column};`);
        console.log(`  ✅ عمود ${columnName} تم إضافته`);
      } catch (error) {
        console.log(`  ⚠️ عمود ${columnName} موجود بالفعل أو فشل إضافته`);
      }
    }

    // Fix packages table - add missing columns
    console.log("🔨 إصلاح جدول الحزم...");
    
    const packageColumns = [
      'name TEXT',
      'overview TEXT',
      'original_price DOUBLE PRECISION',
      'currency TEXT DEFAULT \'USD\'',
      'duration_type TEXT DEFAULT \'days\'',
      'max_participants INTEGER DEFAULT 10',
      'min_age INTEGER DEFAULT 0',
      'max_age INTEGER DEFAULT 100',
      'difficulty_level TEXT DEFAULT \'easy\'',
      'country_id INTEGER',
      'city_id INTEGER',
      'category_id INTEGER',
      'start_date TIMESTAMP',
      'end_date TIMESTAMP',
      'valid_until TIMESTAMP',
      'booking_deadline TIMESTAMP',
      'popular BOOLEAN DEFAULT false',
      'active BOOLEAN DEFAULT true',
      'availability_status TEXT DEFAULT \'available\'',
      'main_image_url TEXT',
      'included_features JSONB DEFAULT \'[]\'',
      'excluded_features JSONB DEFAULT \'[]\'',
      'itinerary JSONB DEFAULT \'[]\'',
      'highlights JSONB DEFAULT \'[]\'',
      'what_to_expect JSONB DEFAULT \'[]\'',
      'additional_info JSONB DEFAULT \'[]\'',
      'cancellation_policy TEXT',
      'terms_and_conditions TEXT',
      'special_instructions TEXT',
      'meeting_point TEXT',
      'pickup_locations JSONB DEFAULT \'[]\'',
      'tags JSONB DEFAULT \'[]\'',
      'seo_title TEXT',
      'seo_description TEXT',
      'seo_keywords TEXT',
      'reviews_count INTEGER DEFAULT 0',
      'booking_count INTEGER DEFAULT 0',
      'views_count INTEGER DEFAULT 0',
      'wishlist_count INTEGER DEFAULT 0',
      'status TEXT DEFAULT \'active\''
    ];

    for (const column of packageColumns) {
      const columnName = column.split(' ')[0];
      try {
        await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS ${column};`);
        console.log(`  ✅ عمود ${columnName} تم إضافته`);
      } catch (error) {
        console.log(`  ⚠️ عمود ${columnName} موجود بالفعل أو فشل إضافته`);
      }
    }

    // Change price column from INTEGER to DOUBLE PRECISION
    try {
      await pool.query(`ALTER TABLE packages ALTER COLUMN price TYPE DOUBLE PRECISION;`);
      console.log(`  ✅ نوع عمود price تم تعديله`);
    } catch (error) {
      console.log(`  ⚠️ فشل في تعديل نوع عمود price:`, error.message);
    }

    // Change rating column from INTEGER to DOUBLE PRECISION  
    try {
      await pool.query(`ALTER TABLE packages ALTER COLUMN rating TYPE DOUBLE PRECISION;`);
      console.log(`  ✅ نوع عمود rating تم تعديله`);
    } catch (error) {
      console.log(`  ⚠️ فشل في تعديل نوع عمود rating:`, error.message);
    }

    // Rename review_count to reviews_count if needed
    try {
      await pool.query(`ALTER TABLE packages RENAME COLUMN review_count TO reviews_count;`);
      console.log(`  ✅ عمود review_count تم إعادة تسميته إلى reviews_count`);
    } catch (error) {
      // Column might already be renamed or not exist
    }

    // Add admin user with correct password hash
    console.log("👤 إضافة مستخدم الإدارة...");
    try {
      // Hash for password "admin123" 
      const hashedPassword = '$2a$10$rQJ4lWrKhiHy1KOPTy5oquxOhzY2.LfVGF0rLbZHlkODlXgJD4v9C';
      
      await pool.query(`
        INSERT INTO users (username, password, password_hash, email, role, display_name, first_name, last_name)
        VALUES ('admin', $1, $1, 'admin@saharajourneys.com', 'admin', 'Administrator', 'Admin', 'User')
        ON CONFLICT (username) DO UPDATE SET 
          password = $1,
          password_hash = $1,
          email = 'admin@saharajourneys.com',
          role = 'admin';
      `, [hashedPassword]);
      
      console.log("✅ مستخدم الإدارة تم إضافته/تحديثه (admin/admin123)");
    } catch (error) {
      console.log("❌ فشل في إضافة مستخدم الإدارة:", error.message);
    }

    // Test the database structure
    console.log("🧪 اختبار هيكل قاعدة البيانات...");
    
    // Test packages query
    try {
      await pool.query('SELECT id, title, overview, price FROM packages LIMIT 1');
      console.log("✅ استعلام الحزم يعمل بنجاح");
    } catch (error) {
      console.log("❌ فشل استعلام الحزم:", error.message);
    }

    // Test users query
    try {
      await pool.query('SELECT id, username, password FROM users LIMIT 1');
      console.log("✅ استعلام المستخدمين يعمل بنجاح");
    } catch (error) {
      console.log("❌ فشل استعلام المستخدمين:", error.message);
    }

    console.log("🎉 إصلاح قاعدة البيانات اكتمل!");

  } catch (error) {
    console.error("❌ خطأ في إصلاح قاعدة البيانات:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema().catch(console.error);
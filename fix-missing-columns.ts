#!/usr/bin/env tsx

import { Pool } from "pg";

const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("🔧 إضافة الأعمدة المفقودة...");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  connectionTimeoutMillis: 30000,
  max: 20,
});

async function fixMissingColumns() {
  try {
    console.log("🔨 إضافة أعمدة مفقودة في جدول packages...");
    
    // Add missing category column (should reference category_id)
    // The error suggests we need "category" but we have "category_id", so let's add both
    await pool.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS category TEXT;`);
    
    // Update category based on category_id if we have sample data
    await pool.query(`
      UPDATE packages SET category = 
        CASE 
          WHEN category_id = 1 THEN 'Cultural Tours'
          WHEN category_id = 2 THEN 'Adventure Travel'  
          WHEN category_id = 3 THEN 'Luxury Travel'
          WHEN category_id = 4 THEN 'Family Packages'
          WHEN category_id = 5 THEN 'Desert Safari'
          ELSE 'General'
        END
      WHERE category IS NULL;
    `);

    console.log("  ✅ عمود category تم إضافته");

    console.log("🔨 إضافة أعمدة مفقودة في جدول homepage_sections...");
    
    // Check what columns exist in homepage_sections
    const homepageColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'homepage_sections' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log("📋 أعمدة homepage_sections الحالية:", homepageColumns.rows.map(r => r.column_name));

    // Add missing columns for homepage_sections
    const missingHomepageColumns = [
      'description TEXT',
      'subtitle TEXT', 
      'button_text TEXT',
      'button_link TEXT',
      'secondary_button_text TEXT',
      'secondary_button_link TEXT',
      'tourists_count TEXT DEFAULT \'5000+\'',
      'destinations_count TEXT DEFAULT \'300+\'',
      'hotels_count TEXT DEFAULT \'200+\'',
      'show_statistics BOOLEAN DEFAULT false',
      'featured_item1_title TEXT',
      'featured_item1_description TEXT', 
      'featured_item1_icon TEXT',
      'featured_item2_title TEXT',
      'featured_item2_description TEXT',
      'featured_item2_icon TEXT',
      'background_color TEXT DEFAULT \'#ffffff\'',
      'text_color TEXT DEFAULT \'#000000\'',
      'image_position TEXT DEFAULT \'left\'',
      'order_position INTEGER DEFAULT 0',
      'active BOOLEAN DEFAULT true',
      'created_at TIMESTAMP DEFAULT NOW()',
      'updated_at TIMESTAMP DEFAULT NOW()'
    ];

    for (const column of missingHomepageColumns) {
      const columnName = column.split(' ')[0];
      try {
        await pool.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS ${column};`);
        console.log(`  ✅ عمود ${columnName} تم إضافته`);
      } catch (error) {
        console.log(`  ⚠️ عمود ${columnName} موجود بالفعل أو فشل إضافته`);
      }
    }

    console.log("🔨 التحقق من جداول أخرى قد تحتاج أعمدة...");

    // Check if countries table is empty
    const countriesCount = await pool.query(`SELECT COUNT(*) FROM countries;`);
    console.log(`📊 عدد البلدان: ${countriesCount.rows[0].count}`);
    
    if (parseInt(countriesCount.rows[0].count) === 0) {
      console.log("🌍 إضافة بيانات البلدان الأساسية...");
      await pool.query(`
        INSERT INTO countries (name, code, description) VALUES
        ('Egypt', 'EG', 'The land of pharaohs and ancient wonders'),
        ('Jordan', 'JO', 'The Hashemite Kingdom with ancient Petra'),
        ('UAE', 'AE', 'Modern cities and desert adventures'),
        ('Morocco', 'MA', 'The gateway to Africa with rich culture'),
        ('Turkey', 'TR', 'Bridge between Europe and Asia');
      `);
      console.log("✅ بيانات البلدان تم إضافتها");
    }

    // Add some sample packages if none exist
    const packagesCount = await pool.query(`SELECT COUNT(*) FROM packages;`);
    console.log(`📦 عدد الحزم: ${packagesCount.rows[0].count}`);
    
    if (parseInt(packagesCount.rows[0].count) === 0) {
      console.log("📦 إضافة حزم تجريبية...");
      await pool.query(`
        INSERT INTO packages (
          title, name, description, short_description, overview, price, 
          currency, duration, category, featured, active, type
        ) VALUES
        ('Cairo City Tour', 'Cairo City Tour', 'Explore the vibrant capital of Egypt', 'Full day Cairo exploration', 'Visit the most iconic landmarks of Cairo including the Pyramids', 99.99, 'USD', 1, 'Cultural Tours', true, true, 'package'),
        ('Luxor Adventure', 'Luxor Adventure', 'Journey through ancient Egyptian history', 'Historical sites tour', 'Discover the treasures of ancient Thebes', 149.99, 'USD', 2, 'Adventure Travel', true, true, 'package'),
        ('Red Sea Diving', 'Red Sea Diving', 'Underwater exploration in the Red Sea', 'Diving experience', 'World-class diving sites with vibrant coral reefs', 199.99, 'USD', 3, 'Adventure Travel', false, true, 'package');
      `);
      console.log("✅ حزم تجريبية تم إضافتها");
    }

    // Test the queries that were failing
    console.log("🧪 اختبار الاستعلامات...");
    
    try {
      const packages = await pool.query('SELECT id, title, category, price FROM packages LIMIT 3');
      console.log(`✅ استعلام الحزم نجح - وجدت ${packages.rows.length} حزم`);
    } catch (error) {
      console.log("❌ فشل استعلام الحزم:", error.message);
    }

    try {
      const homepage = await pool.query('SELECT id, title, description FROM homepage_sections LIMIT 3');
      console.log(`✅ استعلام أقسام الصفحة الرئيسية نجح - وجدت ${homepage.rows.length} أقسام`);
    } catch (error) {
      console.log("❌ فشل استعلام أقسام الصفحة الرئيسية:", error.message);
    }

    console.log("🎉 إضافة الأعمدة المفقودة اكتملت!");

  } catch (error) {
    console.error("❌ خطأ في إضافة الأعمدة:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixMissingColumns().catch(console.error);
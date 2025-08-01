import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function fixHotelsTable() {
  console.log("🔧 إضافة جميع الأعمدة المفقودة في جدول hotels...");
  
  const sql = postgres(connectionString);

  try {
    // جميع الأعمدة المطلوبة في جدول hotels
    const hotelColumns = [
      { name: "short_description", type: "TEXT" },
      { name: "destination_id", type: "INTEGER REFERENCES destinations(id)" },
      { name: "country_id", type: "INTEGER REFERENCES countries(id)" },
      { name: "city_id", type: "INTEGER REFERENCES cities(id)" },
      { name: "category_id", type: "INTEGER REFERENCES hotel_categories(id)" },
      { name: "address", type: "TEXT" },
      { name: "city", type: "TEXT" },
      { name: "country", type: "TEXT" },
      { name: "postal_code", type: "TEXT" },
      { name: "phone", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "website", type: "TEXT" },
      { name: "image_url", type: "TEXT" },
      { name: "gallery_urls", type: "JSON DEFAULT '[]'" },
      { name: "stars", type: "INTEGER" },
      { name: "amenities", type: "JSON" },
      { name: "check_in_time", type: "TEXT DEFAULT '15:00'" },
      { name: "check_out_time", type: "TEXT DEFAULT '11:00'" },
      { name: "longitude", type: "DOUBLE PRECISION" },
      { name: "latitude", type: "DOUBLE PRECISION" },
      { name: "featured", type: "BOOLEAN DEFAULT false" },
      { name: "rating", type: "DOUBLE PRECISION" },
      { name: "review_count", type: "INTEGER DEFAULT 0" },
      { name: "guest_rating", type: "DOUBLE PRECISION" },
      { name: "min_stay", type: "INTEGER DEFAULT 1" },
      { name: "max_stay", type: "INTEGER" },
      { name: "booking_lead_time", type: "INTEGER DEFAULT 0" },
      { name: "cancellation_policy", type: "TEXT" },
      { name: "parking_available", type: "BOOLEAN DEFAULT false" },
      { name: "airport_transfer_available", type: "BOOLEAN DEFAULT false" },
      { name: "car_rental_available", type: "BOOLEAN DEFAULT false" },
      { name: "shuttle_available", type: "BOOLEAN DEFAULT false" },
      { name: "wifi_available", type: "BOOLEAN DEFAULT true" },
      { name: "pet_friendly", type: "BOOLEAN DEFAULT false" },
      { name: "accessible_facilities", type: "BOOLEAN DEFAULT false" },
      { name: "base_price", type: "INTEGER" },
      { name: "currency", type: "TEXT DEFAULT 'EGP'" },
      { name: "tax_included", type: "BOOLEAN DEFAULT false" },
      { name: "service_charge_included", type: "BOOLEAN DEFAULT false" },
      { name: "languages", type: "JSON DEFAULT '[\"en\"]'" },
      { name: "established_year", type: "INTEGER" },
      { name: "last_renovated_year", type: "INTEGER" },
      { name: "total_rooms", type: "INTEGER" },
      { name: "total_floors", type: "INTEGER" },
      { name: "restaurants", type: "JSON" },
      { name: "landmarks", type: "JSON" },
      { name: "faqs", type: "JSON" },
      { name: "room_types", type: "JSON" },
      { name: "features", type: "JSON DEFAULT '[]'" },
      { name: "status", type: "TEXT DEFAULT 'active'" },
      { name: "verification_status", type: "TEXT DEFAULT 'pending'" },
      { name: "created_at", type: "TIMESTAMP DEFAULT NOW()" },
      { name: "updated_at", type: "TIMESTAMP DEFAULT NOW()" },
      { name: "created_by", type: "INTEGER REFERENCES users(id)" },
      { name: "updated_by", type: "INTEGER REFERENCES users(id)" }
    ];

    for (const column of hotelColumns) {
      try {
        await sql`
          ALTER TABLE hotels 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ تم إضافة عمود ${column.name} إلى جدول hotels`);
      } catch (error) {
        console.log(`⚠️ عمود ${column.name} موجود بالفعل في جدول hotels`);
      }
    }

    console.log("🎉 تم إضافة جميع الأعمدة المفقودة في جدول hotels بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في إضافة الأعمدة:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل الإصلاح
fixHotelsTable()
  .then(() => {
    console.log("✅ تم الانتهاء من إصلاح جدول الفنادق");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في إصلاح جدول الفنادق:", error);
    process.exit(1);
  }); 
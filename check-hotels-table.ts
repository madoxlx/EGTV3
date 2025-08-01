import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

// استخدام نفس إعدادات قاعدة البيانات الخارجية
const connectionString = "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

async function checkHotelsTable() {
  console.log("🔍 التحقق من حالة جدول hotels...");
  
  const sql = postgres(connectionString);

  try {
    // التحقق من وجود الأعمدة المهمة
    const importantColumns = [
      "short_description",
      "destination_id", 
      "country_id",
      "city_id",
      "category_id",
      "address",
      "city",
      "country",
      "postal_code",
      "phone",
      "email",
      "website",
      "image_url",
      "gallery_urls",
      "stars",
      "amenities",
      "check_in_time",
      "check_out_time",
      "longitude",
      "latitude",
      "featured",
      "rating",
      "review_count",
      "guest_rating",
      "min_stay",
      "max_stay",
      "booking_lead_time",
      "cancellation_policy",
      "parking_available",
      "airport_transfer_available",
      "car_rental_available",
      "shuttle_available",
      "wifi_available",
      "pet_friendly",
      "accessible_facilities",
      "base_price",
      "currency",
      "tax_included",
      "service_charge_included",
      "languages",
      "established_year",
      "last_renovated_year",
      "total_rooms",
      "total_floors",
      "restaurants",
      "landmarks",
      "faqs",
      "room_types",
      "features",
      "status",
      "verification_status",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by"
    ];

    console.log("📋 التحقق من وجود الأعمدة المهمة:");
    
    for (const column of importantColumns) {
      try {
        const result = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'hotels' AND column_name = ${column}
        `;
        
        if (result.length > 0) {
          console.log(`✅ ${column} - موجود`);
        } else {
          console.log(`❌ ${column} - مفقود`);
        }
      } catch (error) {
        console.log(`❌ ${column} - خطأ في التحقق`);
      }
    }

    // محاولة إضافة العمود المفقود category_id
    console.log("\n🔧 محاولة إضافة العمود category_id...");
    try {
      await sql`
        ALTER TABLE hotels 
        ADD COLUMN category_id INTEGER REFERENCES hotel_categories(id)
      `;
      console.log("✅ تم إضافة عمود category_id بنجاح");
    } catch (error) {
      console.log("⚠️ عمود category_id موجود بالفعل أو خطأ في الإضافة");
    }

    console.log("🎉 تم التحقق من جدول hotels بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ في التحقق من جدول hotels:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// تشغيل التحقق
checkHotelsTable()
  .then(() => {
    console.log("✅ تم الانتهاء من التحقق من جدول الفنادق");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل في التحقق من جدول الفنادق:", error);
    process.exit(1);
  }); 
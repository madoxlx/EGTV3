import { pool } from "./server/db";

async function addTestRestaurantData() {
  const client = await pool.connect();
  
  try {
    console.log('Adding test restaurant data to hotel ID 27...');
    
    const testRestaurants = [
      {
        name: "مطعم الأهرام",
        description: "مطعم راقي يقدم المأكولات المصرية التقليدية",
        cuisine: "مصرية",
        priceRange: "متوسط إلى عالي",
        openingHours: "12:00 PM - 11:00 PM"
      },
      {
        name: "Nile View Restaurant",
        description: "International cuisine with stunning Nile views",
        cuisine: "عالمية",
        priceRange: "عالي",
        openingHours: "6:00 PM - 12:00 AM"
      }
    ];

    const testLandmarks = [
      {
        name: "أهرامات الجيزة",
        distance: "5 كيلومتر",
        description: "واحدة من عجائب الدنيا السبع"
      },
      {
        name: "المتحف المصري",
        distance: "15 كيلومتر", 
        description: "أكبر مجموعة من الآثار المصرية في العالم"
      }
    ];

    const testFaqs = [
      {
        question: "ما هي أوقات تسجيل الوصول والمغادرة؟",
        answer: "تسجيل الوصول من الساعة 2:00 ظهراً وتسجيل المغادرة حتى الساعة 11:00 صباحاً"
      },
      {
        question: "هل يتوفر واي فاي مجاني؟",
        answer: "نعم، يتوفر واي فاي مجاني في جميع أنحاء الفندق"
      }
    ];

    const testRoomTypes = [
      {
        name: "غرفة مفردة",
        description: "غرفة مريحة لشخص واحد",
        maxOccupancy: 1,
        price: 150000
      },
      {
        name: "غرفة مزدوجة",
        description: "غرفة واسعة لشخصين",
        maxOccupancy: 2,
        price: 250000
      }
    ];
    
    // Update hotel with test data
    await client.query(`
      UPDATE hotels 
      SET 
        restaurants = $1,
        landmarks = $2,
        faqs = $3,
        room_types = $4
      WHERE id = 27
    `, [
      JSON.stringify(testRestaurants),
      JSON.stringify(testLandmarks),
      JSON.stringify(testFaqs),
      JSON.stringify(testRoomTypes)
    ]);
    
    console.log('✅ Test restaurant and complex data added to hotel ID 27');
    console.log(`Added ${testRestaurants.length} restaurants`);
    console.log(`Added ${testLandmarks.length} landmarks`);
    console.log(`Added ${testFaqs.length} FAQs`);
    console.log(`Added ${testRoomTypes.length} room types`);
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestRestaurantData().catch(console.error);
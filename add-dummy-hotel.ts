import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable';
const client = postgres(databaseUrl, { ssl: false });
const db = drizzle(client);

async function addDummyHotel() {
  try {
    console.log('🏨 Adding dummy hotel to database...');
    
    const dummyHotel = await db.execute(sql`
      INSERT INTO hotels (
        name, description, destination_id, address, phone, email, 
        stars, status, city, country, postal_code, longitude, latitude, 
        featured, rating, currency, pet_friendly, airport_transfer_available, 
        features, review_count, active, breakfast_included, dinner_included, 
        all_inclusive, pool_type, beach_access, spa_services, fitness_center, 
        family_friendly, property_type, year_built, total_rooms, total_floors,
        restaurants, landmarks, faqs, room_types, booking_policies, amenities
      ) VALUES (
        'Sahara Palace Hotel',
        'Luxury desert hotel with stunning views of the Sahara Desert. Experience authentic Middle Eastern hospitality in our premium accommodations.',
        1,
        '123 Desert View Boulevard, New Cairo',
        '+20-2-1234-5678',
        'reservations@saharapalace.com',
        5,
        'active',
        'Cairo',
        'Egypt',
        '11835',
        31.2357,
        30.0444,
        true,
        4.7,
        'EGP',
        false,
        true,
        '["WiFi", "Air Conditioning", "Room Service", "Spa", "Pool", "Restaurant", "Bar", "Gym", "Concierge", "Valet Parking"]',
        187,
        true,
        true,
        true,
        false,
        'Outdoor',
        false,
        '["Massage", "Facial", "Body Treatments", "Sauna", "Steam Room"]',
        true,
        true,
        'Hotel',
        2018,
        150,
        8,
        '[{"name": "Al Nakheel Restaurant", "cuisine": "Middle Eastern", "rating": 4.5}, {"name": "Sunset Lounge", "cuisine": "International", "rating": 4.2}]',
        '[{"name": "Giza Pyramids", "distance": "15 km"}, {"name": "Egyptian Museum", "distance": "10 km"}, {"name": "Khan el-Khalili Bazaar", "distance": "12 km"}]',
        '[{"question": "What time is check-in?", "answer": "Check-in is at 3:00 PM"}, {"question": "Is breakfast included?", "answer": "Yes, complimentary breakfast is included"}, {"question": "Do you offer airport transfer?", "answer": "Yes, we provide complimentary airport transfer"}]',
        '[{"type": "Deluxe Room", "price": 1500, "capacity": 2}, {"type": "Executive Suite", "price": 2500, "capacity": 4}, {"type": "Presidential Suite", "price": 4000, "capacity": 6}]',
        '{"cancellation": "Free cancellation up to 24 hours before arrival", "pets": "Pets are not allowed", "smoking": "Non-smoking property", "payment": "All major credit cards accepted"}',
        '["WiFi", "Air Conditioning", "Room Service", "Spa", "Pool", "Restaurant", "Bar", "Gym", "Concierge", "Valet Parking", "Business Center", "Meeting Rooms", "Laundry Service", "24/7 Reception"]'
      )
      RETURNING id, name, stars, rating, city, country
    `);
    
    console.log('✅ Dummy hotel added successfully:', dummyHotel[0]);
    
    // Verify the hotel was created
    const verification = await db.execute(sql`
      SELECT id, name, stars, rating, city, country, featured, active, total_rooms
      FROM hotels 
      WHERE id = ${dummyHotel[0].id}
    `);
    
    console.log('🔍 Hotel verification:', verification[0]);
    
  } catch (error) {
    console.error('❌ Error adding dummy hotel:', error);
    throw error;
  }
}

addDummyHotel()
  .then(() => {
    console.log('🎉 Dummy hotel successfully added to database');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to add dummy hotel:', error);
    process.exit(1);
  });
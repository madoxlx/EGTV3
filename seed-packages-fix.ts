import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function seedPackages() {
  console.log('📦 Adding travel packages...');

  try {
    // Insert packages directly using raw SQL to match exact table structure
    await db.execute(sql`
      INSERT INTO packages (
        title, description, price, discounted_price, image_url, gallery_urls, 
        duration, rating, review_count, destination_id, country_id, city_id, 
        featured, type, inclusions, slug
      ) VALUES 
      (
        'Classic Egypt Tour',
        'Explore ancient Egypt with pyramids, temples, and Nile cruise',
        129900, 99900, 
        'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800',
        '["https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800"]',
        7, 5, 156, 
        1, 1, 1,
        true, 'Cultural', 
        '["Flights", "Hotels", "Tours", "Guide"]',
        'classic-egypt-tour'
      ),
      (
        'Jordan Adventure',
        'Discover Petra, Wadi Rum desert, and Dead Sea',
        119900, 89900, 
        'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800',
        '["https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800"]',
        6, 5, 89, 
        2, 2, 3,
        true, 'Adventure', 
        '["Hotels", "Transportation", "Guide", "Meals"]',
        'jordan-adventure'
      ),
      (
        'Dubai Luxury Experience',
        'Luxury shopping, desert safari, and modern attractions',
        149900, 119900, 
        'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800',
        '["https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800"]',
        5, 5, 234, 
        3, 3, 4,
        true, 'Luxury', 
        '["Flights", "5-Star Hotels", "Desert Safari", "City Tours"]',
        'dubai-luxury-experience'
      )
      ON CONFLICT (slug) DO NOTHING
    `);

    console.log('✅ Packages seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
  }
}

seedPackages().catch(console.error);
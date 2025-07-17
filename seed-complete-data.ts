import { db } from './server/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedCompleteData() {
  console.log('🌱 Adding complete sample data...');

  try {
    // First check if destinations exist
    const destCount = await db.execute(sql`SELECT COUNT(*) as count FROM destinations`);
    if (!destCount || destCount.rows.length === 0 || parseInt(destCount.rows[0].count) === 0) {
      console.log('🗺️ Adding destinations...');
      await db.execute(sql`
        INSERT INTO destinations (name, country, country_id, city_id, description, image_url, featured)
        VALUES 
        ('Pyramids of Giza', 'Egypt', 1, 1, 'Ancient wonder of the world featuring the Great Pyramid', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800', true),
        ('Petra', 'Jordan', 2, 3, 'Rose-red city carved into rock cliffs', 'https://images.unsplash.com/photo-1598939525996-fdd906f4b93c?q=80&w=800', true),
        ('Burj Khalifa', 'UAE', 3, 4, 'World''s tallest building with breathtaking views', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800', true)
      `);
    }

    // Then check if packages exist
    const packagesCount = await db.execute(sql`SELECT COUNT(*) as count FROM packages`);
    if (!packagesCount || packagesCount.rows.length === 0 || parseInt(packagesCount.rows[0].count) === 0) {
      console.log('📦 Adding travel packages...');
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
      `);
    }

    // Add admin user if not exists
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE username = 'admin'`);
    if (!userCount || userCount.rows.length === 0 || parseInt(userCount.rows[0].count) === 0) {
      console.log('👤 Adding admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await db.execute(sql`
        INSERT INTO users (username, email, password, full_name, role, status, display_name, first_name, last_name)
        VALUES ('admin', 'admin@saharajourneys.com', ${hashedPassword}, 'System Administrator', 'admin', 'active', 'Admin', 'System', 'Administrator')
      `);
    }

    // Add some sample tours if not exists
    const tourCount = await db.execute(sql`SELECT COUNT(*) as count FROM tours`);
    if (!tourCount || tourCount.rows.length === 0 || parseInt(tourCount.rows[0].count) === 0) {
      console.log('🎯 Adding sample tours...');
      await db.execute(sql`
        INSERT INTO tours (name, description, image_url, destination_id, trip_type, duration, date, num_passengers, price, discounted_price, max_group_size, featured, rating, review_count, status)
        VALUES 
        ('Pyramids Half Day Tour', 'Visit the iconic Pyramids of Giza', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?q=80&w=800', 1, 'Historical', 4, '2025-06-01', 15, 4900, 3900, 20, true, 4, 312, 'active'),
        ('Petra Full Day Tour', 'Explore the ancient city of Petra', 'https://images.unsplash.com/photo-1598939525996-fdd906f4b93c?q=80&w=800', 2, 'Historical', 8, '2025-06-15', 12, 8900, 6900, 15, true, 5, 189, 'active'),
        ('Dubai City Tour', 'Modern Dubai landmarks and attractions', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800', 3, 'City', 6, '2025-07-01', 20, 5900, 4900, 25, true, 4, 267, 'active')
      `);
    }

    console.log('✅ Complete data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedCompleteData().catch(console.error);
import { db } from './server/db';
import { countries, cities, destinations, packages, users } from './shared/schema';
import bcrypt from 'bcryptjs';

async function seedBasicData() {
  console.log('🌱 Adding basic sample data...');

  try {
    // Check if data already exists
    const existingCountries = await db.select().from(countries).limit(1);
    const existingDestinations = await db.select().from(destinations).limit(1);
    const existingPackages = await db.select().from(packages).limit(1);
    
    if (existingCountries.length > 0 && existingDestinations.length > 0 && existingPackages.length > 0) {
      console.log('✅ Data already exists, skipping seed');
      return;
    }

    // Add countries
    console.log('📍 Adding countries...');
    const countryResults = await db.insert(countries).values([
      {
        name: 'Egypt',
        code: 'EG',
        description: 'Land of the Pharaohs and ancient wonders',
        imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800',
        active: true
      },
      {
        name: 'Jordan',
        code: 'JO',
        description: 'Kingdom with the rose-red city of Petra',
        imageUrl: 'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800',
        active: true
      },
      {
        name: 'United Arab Emirates',
        code: 'AE',
        description: 'Modern marvel of luxury and innovation',
        imageUrl: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800',
        active: true
      }
    ]).returning();

    // Add cities
    console.log('🏙️ Adding cities...');
    const cityResults = await db.insert(cities).values([
      {
        name: 'Cairo',
        countryId: countryResults[0].id,
        description: 'Capital of Egypt and largest city in the Arab world',
        imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800',
        active: true
      },
      {
        name: 'Luxor',
        countryId: countryResults[0].id,
        description: 'Ancient Thebes with magnificent temples',
        imageUrl: 'https://images.unsplash.com/photo-1558685582-2d0d597e6b71?q=80&w=800',
        active: true
      },
      {
        name: 'Amman',
        countryId: countryResults[1].id,
        description: 'Capital of Jordan with ancient citadel',
        imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8536229d482?q=80&w=800',
        active: true
      },
      {
        name: 'Dubai',
        countryId: countryResults[2].id,
        description: 'Modern metropolis with iconic skyline',
        imageUrl: 'https://images.unsplash.com/photo-1548813395-e5217e9a3520?q=80&w=800',
        active: true
      }
    ]).returning();

    // Add destinations
    console.log('🗺️ Adding destinations...');
    const destinationResults = await db.insert(destinations).values([
      {
        name: 'Pyramids of Giza',
        country: 'Egypt',
        countryId: countryResults[0].id,
        cityId: cityResults[0].id,
        description: 'Ancient wonder of the world featuring the Great Pyramid',
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800',
        featured: true
      },
      {
        name: 'Petra',
        country: 'Jordan',
        countryId: countryResults[1].id,
        cityId: cityResults[2].id,
        description: 'Rose-red city carved into rock cliffs',
        imageUrl: 'https://images.unsplash.com/photo-1598939525996-fdd906f4b93c?q=80&w=800',
        featured: true
      },
      {
        name: 'Burj Khalifa',
        country: 'UAE',
        countryId: countryResults[2].id,
        cityId: cityResults[3].id,
        description: 'World\'s tallest building with breathtaking views',
        imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800',
        featured: true
      }
    ]).returning();

    // Add sample packages
    console.log('📦 Adding travel packages...');
    await db.insert(packages).values([
      {
        title: 'Classic Egypt Tour',
        description: 'Explore ancient Egypt with pyramids, temples, and Nile cruise',
        price: 129900,
        discountedPrice: 99900,
        duration: 7,
        imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800',
        rating: 4.8,
        reviewCount: 156,
        destinationId: destinationResults[0].id,
        countryId: countryResults[0].id,
        cityId: cityResults[0].id,
        featured: true,
        type: 'Cultural',
        slug: 'classic-egypt-tour'
      },
      {
        title: 'Jordan Adventure',
        description: 'Discover Petra, Wadi Rum desert, and Dead Sea',
        price: 119900,
        discountedPrice: 89900,
        duration: 6,
        imageUrl: 'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800',
        rating: 4.7,
        reviewCount: 89,
        destinationId: destinationResults[1].id,
        countryId: countryResults[1].id,
        cityId: cityResults[2].id,
        featured: true,
        type: 'Adventure',
        slug: 'jordan-adventure'
      },
      {
        title: 'Dubai Luxury Experience',
        description: 'Luxury shopping, desert safari, and modern attractions',
        price: 149900,
        discountedPrice: 119900,
        duration: 5,
        imageUrl: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800',
        rating: 4.9,
        reviewCount: 234,
        destinationId: destinationResults[2].id,
        countryId: countryResults[2].id,
        cityId: cityResults[3].id,
        featured: true,
        type: 'Luxury',
        slug: 'dubai-luxury-experience'
      }
    ]);

    // Add admin user
    console.log('👤 Adding admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await db.insert(users).values([
      {
        username: 'admin',
        email: 'admin@saharajourneys.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'admin',
        status: 'active',
        displayName: 'Admin',
        firstName: 'System',
        lastName: 'Administrator'
      }
    ]);

    console.log('✅ Basic data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedBasicData().catch(console.error);
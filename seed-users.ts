import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

async function seedUsers() {
  const client = postgres(databaseUrl, {
    ssl: databaseUrl?.includes('localhost') ? false : 'require',
  });
  
  const db = drizzle(client);
  
  try {
    console.log('Seeding admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await db.insert(users).values({
      username: 'admin',
      email: 'admin@saharajourneys.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      bio: 'System administrator for Sahara Journeys',
    }).onConflictDoNothing();
    
    console.log('Admin user seeded successfully');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await client.end();
  }
}

seedUsers();
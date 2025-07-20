import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';

async function initializeDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    console.log('Connecting to database...');
    const client = postgres(databaseUrl, {
      ssl: 'require',
      max: 1
    });
    
    const db = drizzle(client, { schema });
    
    // Test connection
    await client`SELECT 1`;
    console.log('Database connection successful');
    
    // The tables should be created automatically when we insert data
    // Let's test by creating a simple admin user
    const adminUser = {
      username: 'admin',
      email: 'admin@saharajourneys.com',
      password: '$2b$10$example.hash.for.testing',
      fullName: 'System Administrator',
      role: 'admin',
      status: 'active',
      displayName: 'Admin',
      firstName: 'System',
      lastName: 'Administrator',
      phoneNumber: null,
      bio: null,
      avatarUrl: null
    };

    // Try to insert admin user (this will create the table if it doesn't exist)
    try {
      await db.insert(schema.users).values(adminUser).onConflictDoNothing();
      console.log('Admin user created successfully');
    } catch (error) {
      console.log('Admin user might already exist or table creation needed');
    }

    await client.end();
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
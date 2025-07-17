import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Initialize the database by pushing the schema and then running setup
 * This ensures tables exist before any seeding operations
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔧 Initializing database...');
  
  try {
    // Test database connection first with timeout
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    
    console.log('🔍 Testing database connection...');
    const connectionPromise = db.execute(sql`SELECT 1 as test`);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 15000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Database connection successful');
    
    // Skip drizzle-kit push since tables are already created
    // Instead, run our custom setup
    console.log('📋 Running database setup...');
    const { setupDatabase } = await import('../setup-for-remix');
    await setupDatabase();
    
    console.log('👤 Setting up admin user...');
    const adminSetup = await import('./admin-setup');
    await adminSetup.setupAdmin();
    
    console.log('📦 Seeding package categories...');
    const packageCategoriesSetup = await import('./seed-package-categories');
    await packageCategoriesSetup.seedPackageCategories();
    
    console.log('🌱 Running additional seeding...');
    const seedModule = await import('./seed');
    await seedModule.seed();
    
    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('⚠️  Application will continue without database initialization');
    // Don't exit the process, just log the error
    // The app can still run even if seeding fails
  }
}
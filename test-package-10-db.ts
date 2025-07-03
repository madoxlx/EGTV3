import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { packages } from './shared/schema';
import { eq } from 'drizzle-orm';

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZN9Ylt3AoQRJ@ep-dawn-voice-a8bd2yi7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

async function testPackage10() {
  console.log('Testing package ID 10 in database...');
  
  try {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle({ client: pool, schema: { packages } });
    
    // Get package data
    const packageData = await db.select().from(packages).where(eq(packages.id, 10));
    
    console.log('Package 10 data:', JSON.stringify(packageData, null, 2));
    
    if (packageData.length > 0) {
      const pkg = packageData[0];
      console.log('\nPackage 10 details:');
      console.log('- Title:', pkg.title);
      console.log('- Selected Hotels:', pkg.selectedHotels);
      console.log('- Rooms:', pkg.rooms);
      console.log('- Gallery URLs:', pkg.galleryUrls);
      
      // Check if hotel and room data exists
      if (pkg.selectedHotels && Array.isArray(pkg.selectedHotels) && pkg.selectedHotels.length > 0) {
        console.log('\n✅ Package has hotel data in database');
        console.log('Hotels:', pkg.selectedHotels);
        
        if (pkg.rooms && Array.isArray(pkg.rooms) && pkg.rooms.length > 0) {
          console.log('✅ Package has room data in database');
          console.log('Rooms:', pkg.rooms);
        } else {
          console.log('❌ Package has no room data in database');
        }
      } else {
        console.log('\n❌ Package has no hotel data in database');
        console.log('This indicates the package creation form has an issue saving hotel data');
      }
    } else {
      console.log('❌ Package ID 10 not found in database');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('Error checking package 10:', error);
  }
}

testPackage10();
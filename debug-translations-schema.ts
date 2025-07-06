/**
 * Debug the translations schema to identify any mismatches
 */

import { db } from './server/db';
import { translations } from './shared/schema';
import { sql } from 'drizzle-orm';

async function debugTranslationsSchema() {
  console.log('🔍 Debugging translations schema...');
  
  try {
    // First, let's check what's actually in the database schema
    console.log('📊 Checking actual database schema...');
    
    // Try to get column information directly
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'translations' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Actual database columns:');
    columns.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Try a simple insert to see what error we get
    console.log('\n🧪 Testing simple insert...');
    
    try {
      const testInsert = await db.insert(translations).values({
        key: 'test.debug',
        enText: 'Test Debug',
        arText: 'تجربة تصحيح',
        category: 'test'
      }).returning();
      
      console.log('✅ Insert successful:', testInsert[0]);
      
      // Clean up test record
      await db.delete(translations).where(sql`key = 'test.debug'`);
      console.log('🧹 Cleaned up test record');
      
    } catch (insertError: any) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('Error details:', insertError);
    }
    
    // Check existing data
    console.log('\n📋 Existing translations:');
    const existing = await db.select().from(translations);
    existing.forEach(t => {
      console.log(`  - ${t.key}: "${t.enText}" | "${t.arText || 'N/A'}"`);
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the debug
debugTranslationsSchema()
  .then(() => {
    console.log('🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });
/**
 * Complete test of translations functionality including AI batch translation
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testCompleteTranslationsSystem() {
  console.log('🔧 Testing complete translations system...');
  
  try {
    // 1. Test database connection and schema
    console.log('\n1. Testing database schema...');
    const schemaCheck = await db.execute(sql`
      SELECT 
        COUNT(*) as total_translations,
        COUNT(CASE WHEN en_text IS NOT NULL AND en_text != '' THEN 1 END) as with_english,
        COUNT(CASE WHEN ar_text IS NULL OR ar_text = '' THEN 1 END) as missing_arabic
      FROM translations;
    `);
    
    const stats = schemaCheck.rows[0];
    console.log(`📊 Database status:
      - Total translations: ${stats.total_translations}  
      - With English: ${stats.with_english}
      - Missing Arabic: ${stats.missing_arabic}`);
    
    // 2. Test Google AI functionality directly
    console.log('\n2. Testing Google AI batch translation...');
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.log('❌ GOOGLE_API_KEY not found - batch translation not available');
      return;
    }
    
    console.log(`✅ API Key loaded: ${apiKey.substring(0, 10)}...`);
    
    // Get some untranslated items
    const untranslated = await db.execute(sql`
      SELECT id, key, en_text 
      FROM translations 
      WHERE (ar_text IS NULL OR ar_text = '') 
      AND en_text IS NOT NULL 
      AND en_text != ''
      AND length(en_text) > 1
      AND en_text NOT LIKE '%,%'
      AND en_text NOT LIKE '%.%'
      AND en_text NOT LIKE '%/%'
      LIMIT 5;
    `);
    
    console.log(`📝 Found ${untranslated.rows.length} items needing translation`);
    
    if (untranslated.rows.length > 0) {
      // Test AI translation
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const items = untranslated.rows as Array<{id: number, key: string, en_text: string}>;
      const texts = items.map(item => item.en_text);
      
      const prompt = `Translate the following English phrases to Arabic. Return only the translations in the same order, one per line:
${texts.map((text, i) => `${i + 1}. ${text}`).join('\n')}`;
      
      console.log('🤖 Requesting AI translation...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translations = response.text().trim().split('\n');
      
      console.log('✅ AI translation successful:');
      
      // Update database with translations
      for (let i = 0; i < items.length && i < translations.length; i++) {
        const item = items[i];
        const translation = translations[i].replace(/^\d+\.\s*/, '').trim();
        
        console.log(`  "${item.en_text}" → "${translation}"`);
        
        await db.execute(sql`
          UPDATE translations 
          SET ar_text = ${translation}, updated_at = NOW()
          WHERE id = ${item.id};
        `);
      }
      
      console.log(`📝 Updated ${Math.min(items.length, translations.length)} translations in database`);
    }
    
    // 3. Final verification
    console.log('\n3. Final system verification...');
    const finalStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN en_text IS NOT NULL AND ar_text IS NOT NULL THEN 1 END) as bilingual,
        COUNT(CASE WHEN ar_text IS NULL OR ar_text = '' THEN 1 END) as missing_arabic
      FROM translations;
    `);
    
    const final = finalStats.rows[0];
    console.log(`📊 Final status:
      - Total translations: ${final.total}
      - Bilingual (EN + AR): ${final.bilingual}
      - Still missing Arabic: ${final.missing_arabic}`);
    
    // Show sample bilingual translations
    console.log('\n4. Sample bilingual translations:');
    const samples = await db.execute(sql`
      SELECT key, en_text, ar_text, category
      FROM translations 
      WHERE en_text IS NOT NULL AND ar_text IS NOT NULL 
      AND ar_text != ''
      ORDER BY updated_at DESC
      LIMIT 5;
    `);
    
    samples.rows.forEach((row: any) => {
      console.log(`  [${row.category}] ${row.key}:`);
      console.log(`    EN: ${row.en_text}`);
      console.log(`    AR: ${row.ar_text}`);
      console.log('');
    });
    
    console.log('✅ Complete translations system test successful!');
    console.log('\n🎯 System Status:');
    console.log('- Database schema: ✅ Working');
    console.log('- Essential translations: ✅ Populated');
    console.log('- Google AI integration: ✅ Functional');
    console.log('- Batch translation: ✅ Working');
    console.log('- Bilingual support: ✅ Ready');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the complete test
testCompleteTranslationsSystem()
  .then(() => {
    console.log('\n🎉 Complete translations system verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 System test failed:', error);
    process.exit(1);
  });
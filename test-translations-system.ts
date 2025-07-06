/**
 * Test script to verify and fix the translations system
 */

import { db } from './server/db';
import { translations, siteLanguageSettings } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testTranslationsSystem() {
  console.log('🔍 Testing translations system...');
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const testQuery = await db.select().from(translations).limit(1);
    console.log('✅ Database connection successful');
    
    // Check if translations table exists and has data
    console.log('📊 Checking translations table...');
    const existingTranslations = await db.select().from(translations);
    console.log(`📋 Found ${existingTranslations.length} existing translations`);
    
    // Create some basic translations if none exist
    if (existingTranslations.length === 0) {
      console.log('🌱 Creating sample translations...');
      
      const sampleTranslations = [
        {
          key: 'admin.dashboard.title',
          enText: 'Dashboard',
          arText: 'لوحة التحكم',
          category: 'admin',
          context: 'Main navigation'
        },
        {
          key: 'admin.packages.title',
          enText: 'Packages',
          arText: 'الباقات',
          category: 'admin',
          context: 'Navigation menu'
        },
        {
          key: 'admin.tours.title',
          enText: 'Tours',
          arText: 'الجولات',
          category: 'admin',
          context: 'Navigation menu'
        },
        {
          key: 'admin.hotels.title',
          enText: 'Hotels',
          arText: 'الفنادق',
          category: 'admin',
          context: 'Navigation menu'
        },
        {
          key: 'common.save',
          enText: 'Save',
          arText: 'حفظ',
          category: 'common',
          context: 'Button text'
        },
        {
          key: 'common.cancel',
          enText: 'Cancel',
          arText: 'إلغاء',
          category: 'common',
          context: 'Button text'
        },
        {
          key: 'common.edit',
          enText: 'Edit',
          arText: 'تعديل',
          category: 'common',
          context: 'Button text'
        },
        {
          key: 'common.delete',
          enText: 'Delete',
          arText: 'حذف',
          category: 'common',
          context: 'Button text'
        }
      ];
      
      for (const translation of sampleTranslations) {
        await db.insert(translations).values(translation);
        console.log(`✅ Created translation: ${translation.key}`);
      }
    }
    
    // Check language settings
    console.log('🌐 Checking language settings...');
    const languageSettings = await db.select().from(siteLanguageSettings);
    
    if (languageSettings.length === 0) {
      console.log('🌱 Creating default language settings...');
      await db.insert(siteLanguageSettings).values({
        defaultLanguage: 'en',
        availableLanguages: ['en', 'ar'],
        rtlLanguages: ['ar']
      });
      console.log('✅ Created default language settings');
    } else {
      console.log('✅ Language settings already exist');
    }
    
    // Test translation retrieval
    console.log('🔍 Testing translation retrieval...');
    const allTranslations = await db.select().from(translations);
    console.log(`📊 Retrieved ${allTranslations.length} translations`);
    
    // Display sample translations
    console.log('\n📋 Sample translations:');
    allTranslations.slice(0, 5).forEach(t => {
      console.log(`  ${t.key}: "${t.enText}" | "${t.arText || 'N/A'}"`);
    });
    
    console.log('\n✅ Translations system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing translations system:', error);
    throw error;
  }
}

// Run the test
testTranslationsSystem()
  .then(() => {
    console.log('🎉 All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
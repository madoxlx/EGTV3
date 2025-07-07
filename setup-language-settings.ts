/**
 * Setup language settings for the application
 * This ensures the language switcher appears by configuring proper language settings
 */

import { db } from './server/db';
import { siteLanguageSettings } from './shared/schema';

async function setupLanguageSettings() {
  try {
    console.log('Setting up language settings...');
    
    // Check if language settings already exist
    const existingSettings = await db.select().from(siteLanguageSettings).limit(1);
    
    if (existingSettings.length > 0) {
      console.log('Language settings already exist:', existingSettings[0]);
      
      // Update to ensure both languages are available with proper JSON formatting
      const updated = await db.update(siteLanguageSettings)
        .set({
          defaultLanguage: 'en',
          availableLanguages: JSON.stringify(['en', 'ar']),
          rtlLanguages: JSON.stringify(['ar']),
          updatedAt: new Date()
        })
        .returning();
        
      console.log('Updated language settings:', updated[0]);
      
      // Parse the arrays safely for display
      const availableLanguages = typeof updated[0].availableLanguages === 'string' 
        ? JSON.parse(updated[0].availableLanguages) 
        : updated[0].availableLanguages;
      const rtlLanguages = typeof updated[0].rtlLanguages === 'string'
        ? JSON.parse(updated[0].rtlLanguages)
        : updated[0].rtlLanguages;
        
      return { ...updated[0], availableLanguages, rtlLanguages };
    }
    
    // Create new language settings
    const newSettings = await db.insert(siteLanguageSettings).values({
      defaultLanguage: 'en',
      availableLanguages: JSON.stringify(['en', 'ar']),
      rtlLanguages: JSON.stringify(['ar']),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('Created language settings:', newSettings[0]);
    return newSettings[0];
    
  } catch (error) {
    console.error('Error setting up language settings:', error);
    throw error;
  }
}

// Run the setup
setupLanguageSettings()
  .then((settings) => {
    console.log('✅ Language settings setup complete!');
    console.log('Available languages:', settings.availableLanguages);
    console.log('Default language:', settings.defaultLanguage);
    console.log('RTL languages:', settings.rtlLanguages);
    console.log('');
    console.log('🌍 Language switcher should now appear in the header!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to setup language settings:', error);
    process.exit(1);
  });
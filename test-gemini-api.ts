/**
 * Test script to verify Google Gemini API functionality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiAPI() {
  console.log('🔧 Testing Google Gemini API...');
  
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('API Key available:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY not found in environment variables');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('✅ Google AI client initialized');
    
    // Test simple translation
    const testText = "Home";
    const prompt = `Translate the following English text to Arabic, return only the translation without any explanation: "${testText}"`;
    
    console.log(`🔄 Testing translation of: "${testText}"`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();
    
    console.log(`✅ Translation successful: "${testText}" → "${translation}"`);
    
    // Test batch translation format
    const batchPrompt = `Translate the following English phrases to Arabic. Return only the translations in the same order, one per line:
1. Dashboard
2. Settings  
3. Create Package`;

    console.log('🔄 Testing batch translation...');
    
    const batchResult = await model.generateContent(batchPrompt);
    const batchResponse = await batchResult.response;
    const batchTranslation = batchResponse.text();
    
    console.log('✅ Batch translation result:');
    console.log(batchTranslation);
    
  } catch (error: any) {
    console.error('❌ Gemini API test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testGeminiAPI()
  .then(() => {
    console.log('\n🎉 Gemini API test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
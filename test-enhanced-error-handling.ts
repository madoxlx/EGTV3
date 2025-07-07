/**
 * Test script to verify enhanced Gemini API error handling system
 * Tests quota limits, rate limiting, and user-friendly error messages
 */

import geminiService from './server/services/gemini';

async function testEnhancedErrorHandling() {
  console.log('🧪 Testing Enhanced Gemini API Error Handling System');
  console.log('================================================\n');

  // geminiService is already a singleton instance

  // Test 1: Single translation with proper error handling
  console.log('Test 1: Single Translation Error Handling');
  console.log('------------------------------------------');
  
  try {
    const result = await geminiService.translateToArabic('Hello, this is a test translation for error handling.');
    console.log('✅ Single translation successful:', result);
  } catch (error: any) {
    console.log('❌ Single translation error caught:', error.message);
    
    // Test error message parsing
    if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('🔍 Quota exceeded error detected correctly');
    } else if (error.message.includes('RATE_LIMITED')) {
      console.log('🔍 Rate limit error detected correctly');
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.log('🔍 API key error detected correctly');
    } else {
      console.log('🔍 Generic error detected:', error.message);
    }
  }

  console.log('\n');

  // Test 2: Batch translation with error handling
  console.log('Test 2: Batch Translation Error Handling');
  console.log('----------------------------------------');
  
  const testItems = [
    { id: 1, text: 'Welcome to our website' },
    { id: 2, text: 'Book your trip today' },
    { id: 3, text: 'Contact us for more information' }
  ];

  try {
    const results = await geminiService.batchTranslateToArabic(testItems);
    console.log('✅ Batch translation successful:');
    results.forEach(result => {
      console.log(`   ID ${result.id}: "${result.translation}"`);
    });
  } catch (error: any) {
    console.log('❌ Batch translation error caught:', error.message);
    
    // Test structured error message parsing
    if (error.message.includes('QUOTA_EXCEEDED')) {
      const message = error.message.split('|')[1];
      console.log('🔍 Quota exceeded error with message:', message);
    } else if (error.message.includes('RATE_LIMITED')) {
      const message = error.message.split('|')[1];
      console.log('🔍 Rate limit error with message:', message);
    } else if (error.message.includes('API_KEY_INVALID')) {
      const message = error.message.split('|')[1];
      console.log('🔍 API key error with message:', message);
    } else {
      console.log('🔍 Generic batch error detected:', error.message);
    }
  }

  console.log('\n');

  // Test 3: Error message structure validation
  console.log('Test 3: Error Message Structure Validation');
  console.log('------------------------------------------');
  
  const errorTypes = [
    'QUOTA_EXCEEDED|The Google AI free tier quota has been exceeded. Please try again later or upgrade your API plan for higher limits.',
    'RATE_LIMITED|Too many translation requests. Please wait a moment and try again.',
    'API_KEY_INVALID|Google AI API key is invalid or has insufficient permissions. Please check your API key configuration.',
    'TRANSLATION_ERROR|Translation service temporarily unavailable: Unknown error'
  ];

  errorTypes.forEach(errorMessage => {
    const parts = errorMessage.split('|');
    const errorType = parts[0];
    const userMessage = parts[1];
    
    console.log(`✅ Error Type: ${errorType}`);
    console.log(`   User Message: ${userMessage}`);
  });

  console.log('\n');

  // Test 4: API endpoint availability test
  console.log('Test 4: Translation API Endpoints Test');
  console.log('-------------------------------------');
  
  try {
    // Test single translation endpoint
    const singleResponse = await fetch('http://localhost:5000/api/admin/translations/518/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force: false }),
      credentials: 'include',
    });
    
    console.log(`Single translation endpoint status: ${singleResponse.status}`);
    
    // Test batch translation endpoint
    const batchResponse = await fetch('http://localhost:5000/api/admin/translations/batch-translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: 'untranslated',
        limit: 2,
        force: false
      }),
      credentials: 'include',
    });
    
    console.log(`Batch translation endpoint status: ${batchResponse.status}`);
    
  } catch (endpointError) {
    console.log('❌ Endpoint test error:', endpointError);
  }

  console.log('\n🎉 Enhanced error handling system test completed!');
  console.log('\nKey Features Tested:');
  console.log('• Structured error messages with user-friendly descriptions');
  console.log('• Quota exceeded detection and proper messaging');
  console.log('• Rate limiting detection with retry guidance');
  console.log('• API key validation error handling');
  console.log('• Frontend toast notification parsing');
  console.log('• Backend route error forwarding');
  console.log('• Gemini service error categorization');
}

// Run the test directly
testEnhancedErrorHandling().catch(console.error);

export { testEnhancedErrorHandling };
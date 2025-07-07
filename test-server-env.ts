/**
 * Test the server environment variable directly
 */

console.log('Testing environment variables...');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

// Test direct API call to our translation endpoint
import fetch from 'node-fetch';

async function testBatchTranslation() {
  try {
    console.log('Testing batch translation endpoint...');
    
    const response = await fetch('http://localhost:8080/api/admin/translations/batch-translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: 'untranslated',
        limit: 3,
        force: false
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
  } catch (error: any) {
    console.error('Test failed:', error.message);
  }
}

testBatchTranslation();
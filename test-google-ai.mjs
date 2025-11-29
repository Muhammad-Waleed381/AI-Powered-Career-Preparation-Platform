/**
 * Test Google AI Studio API Key Directly
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_API_KEY = 'AIzaSyCp0vi4Tg7dELCbe1vbvcUZ6Oo9qzZ3JxQ';
const MODEL_NAME = 'gemini-2.0-flash-exp';

async function testGoogleAI() {
  console.log('🧪 Testing Google AI Studio API...\n');

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    console.log('✅ Google AI client created');
    console.log(`📍 Model: ${MODEL_NAME}\n`);

    const prompt = 'Say "Hello from Gemini!" in JSON format like {"message": "..."}';
    
    console.log('📤 Sending test prompt...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('\n✅ Success!');
    console.log('Response:', text);
    console.log('\n🎉 Google AI API is working perfectly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\nThe API key appears to be invalid. Please check:');
      console.error('1. Go to https://aistudio.google.com/app/apikey');
      console.error('2. Make sure the API key is enabled');
      console.error('3. Copy the correct key');
    }
  }
}

testGoogleAI();

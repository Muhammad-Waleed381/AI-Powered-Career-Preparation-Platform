/**
 * Test OpenRouter API Key Directly
 */

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const FREE_MODEL = 'google/gemini-2.0-flash-exp:free';

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API...\n');

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Career Preparation Platform',
      },
      body: JSON.stringify({
        model: FREE_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello, testing!" in a JSON format like {message: "..."}' }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    console.log('Status:', response.status, response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ Error Response:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('\n✅ Success!');
    console.log('Model:', data.model);
    console.log('Response:', data.choices[0]?.message?.content);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testOpenRouter();

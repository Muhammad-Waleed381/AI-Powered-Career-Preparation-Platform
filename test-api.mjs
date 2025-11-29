/**
 * Test script for Interview Prep API
 * Run with: node --loader ts-node/esm test-api.mjs
 */

const API_URL = 'http://localhost:3000/api/interview-prep';

async function testAPI() {
  console.log('🧪 Testing Interview Prep API...\n');

  const testData = {
    company: 'Google',
    role: 'Software Engineer',
    technologies: ['TypeScript', 'React', 'Node.js'],
  };

  console.log('📤 Sending request:', JSON.stringify(testData, null, 2));
  console.log('\n⏳ This will take 30-60 seconds (web search + AI analysis)...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      return;
    }

    const result = await response.json();
    console.log('✅ Success!\n');
    console.log('📊 Results Summary:');
    console.log(`  - Company Insights: ${result.data.companyInsights.culture?.length || 0} cultural points`);
    console.log(`  - Role Insights: ${result.data.roleInsights.requiredSkills?.length || 0} required skills`);
    console.log(`  - Tech Insights: ${result.data.techInsights?.length || 0} technologies analyzed`);
    console.log(`  - Technical Questions: ${result.data.questions.technical?.length || 0}`);
    console.log(`  - Behavioral Questions: ${result.data.questions.behavioral?.length || 0}`);
    console.log('\n📝 Sample Technical Question:');
    if (result.data.questions.technical?.[0]) {
      console.log(JSON.stringify(result.data.questions.technical[0], null, 2));
    }

    // Save full result to file
    const fs = await import('fs');
    fs.writeFileSync(
      'test-result.json',
      JSON.stringify(result.data, null, 2)
    );
    console.log('\n💾 Full results saved to: test-result.json');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPI();

const fetch = require('node-fetch'); // Next.js might not have node-fetch in global scope for scripts, but let's try native fetch if node 18+

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/interview-prep', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                company: 'Netflix',
                role: 'Backend Engineer',
                technologies: ['Java', 'Spring Boot'],
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();

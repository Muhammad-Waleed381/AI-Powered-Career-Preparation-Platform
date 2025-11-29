import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

// Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            process.env[key] = value;
        }
    });
} else {
    console.error('.env.local file not found!');
    process.exit(1);
}

console.log('API Key loaded:', process.env.GROQ_API_KEY ? 'Yes (starts with ' + process.env.GROQ_API_KEY.substring(0, 4) + '...)' : 'No');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
    try {
        console.log('Sending test request to Groq...');
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: 'Say "Hello, World!"',
                },
            ],
            model: 'llama-3.3-70b-versatile',
        });

        console.log('Response received:');
        console.log(completion.choices[0]?.message?.content);
        console.log('Test PASSED');
    } catch (error) {
        console.error('Test FAILED');
        console.error(error);
    }
}

testGroq();

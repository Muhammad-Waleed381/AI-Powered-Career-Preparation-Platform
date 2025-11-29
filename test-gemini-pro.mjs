import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('AIzaSyCp0vi4Tg7dELCbe1vbvcUZ6Oo9qzZ3JxQ');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const result = await model.generateContent('Say just the word WORKING in caps if you can read this');
const response = await result.response;
console.log(' Google AI working! Response:', response.text());

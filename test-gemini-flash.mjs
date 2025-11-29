import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCp0vi4Tg7dELCbe1vbvcUZ6Oo9qzZ3JxQ');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const result = await model.generateContent('Respond with just: WORKING');
const response = result.response;
console.log(' Gemini 1.5 Flash is', response.text());

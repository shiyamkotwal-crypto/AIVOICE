import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing @google/genai...');
const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key:', apiKey ? apiKey.slice(0, 8) + '...' : 'none');

try {
  const client = new GoogleGenAI({ apiKey });
  console.log('Client keys:', Object.keys(client));
  console.log('Has client.interactions?', Boolean(client.interactions));
  console.log('Has client.models?', Boolean(client.models));
  if (client.models) {
    console.log('client.models keys:', Object.keys(client.models));
  }
} catch (e) {
  console.error('Error in test:', e);
}

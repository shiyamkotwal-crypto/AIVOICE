import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing with API Key prefix:', apiKey ? apiKey.substring(0, 15) + '...' : 'NONE');

const client = new GoogleGenAI({ apiKey });

async function run() {
  const modelsToTest = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  for (const model of modelsToTest) {
    try {
      console.log(`\nAttempting with model: ${model}...`);
      const response = await client.models.generateContent({
        model: model,
        contents: 'Hello, respond in one short sentence: VoiceBridge AI test.',
      });
      console.log(`✅ Success with ${model}:`, response.text);
      return;
    } catch (err) {
      console.log(`❌ Failed with ${model}:`, err.message);
    }
  }
}

run();

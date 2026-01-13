const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('----------------------------------------');
    console.log('Testing Gemini API Integration');
    console.log('----------------------------------------');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ ERROR: GEMINI_API_KEY not found in .env');
        return;
    }

    if (apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.error('❌ ERROR: Key is still the placeholder text.');
        return;
    }

    console.log(`✅ API Key found (Length: ${apiKey.length})`);

    try {
        console.log('Connection to Google AI...');
        const genAI = new GoogleGenerativeAI(apiKey);

        // precise model we are testing
        const modelName = "gemini-2.5-flash";
        console.log(`Using Model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = "Explain briefly what DNA is in one sentence.";
        console.log(`Sending Prompt: "${prompt}"`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS! Received Response:');
        console.log('----------------------------------------');
        console.log(text);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('\n❌ REQUEST FAILED');
        console.error('Error Message:', error.message);

        if (error.message.includes('404')) {
            console.error('--> The model name might be wrong or not available for your key.');
        } else if (error.message.includes('API key not valid')) {
            console.error('--> Your API Key is invalid.');
        }
    }
}

testGemini();

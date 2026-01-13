require('dotenv').config({ path: '../.env' });

console.log('\n=============================================');
console.log('   ENVIRONMENT CONFIGURATION CHECKER');
console.log('=============================================\n');

const pubmed = process.env.PUBMED_API_KEY;
const gemini = process.env.GEMINI_API_KEY;

// 1. Check PubMed Key
console.log('1. Checking PubMed API Key:');
if (!pubmed) {
    console.log('   [MISSING] PUBMED_API_KEY is not found in .env');
    console.log('   -> Result: App will work with lower rate limits.');
} else if (pubmed.trim() === 'YOUR_PUBMED_API_KEY_HERE') {
    console.log('   [WARNING] Key is still the default placeholder.');
    console.log('   -> Result: App will work with lower rate limits (API key ignored).');
} else {
    console.log(`   [OK] Valid key found (Length: ${pubmed.length} characters)`);
    console.log('   -> Result: Full access enabled.');
}

console.log('\n2. Checking Gemini API Key:');
// 2. Check Gemini Key
if (!gemini) {
    console.log('   [ERROR] GEMINI_API_KEY is not found in .env');
    console.log('   -> Result: Summarization WILL NOT WORK.');
} else if (gemini.trim() === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('   [ERROR] Key is still the default placeholder.');
    console.log('   -> Result: Summarization WILL FAIL. You must replace this with a real key.');
} else {
    console.log(`   [OK] Valid key found (Length: ${gemini.length} characters)`);
    console.log('   -> Result: AI Summaries should work.');
}

console.log('\n=============================================');
console.log('To fix errors, edit the file: .env');
console.log('=============================================\n');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parseStringPromise } = require('xml2js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to clean XML text
const cleanText = (text) => {
    if (!text) return '';
    if (Array.isArray(text)) {
        if (text.length === 0) return '';
        if (typeof text[0] === 'string') return text[0];
        if (typeof text[0] === 'object' && text[0]._) return text[0]._; // Handle {_: 'text'}
        return '';
    }
    return typeof text === 'string' ? text : '';
};

// Helper to parse abstract specifically
const parseAbstract = (abstractNode) => {
    if (!abstractNode || !abstractNode[0] || !abstractNode[0].AbstractText) return 'No abstract available.';

    const abstractTexts = abstractNode[0].AbstractText;

    // Case 1: Simple array of strings
    if (Array.isArray(abstractTexts) && typeof abstractTexts[0] === 'string') {
        return abstractTexts.join(' ');
    }

    // Case 2: Structured abstract (Array of objects with Label)
    if (Array.isArray(abstractTexts)) {
        return abstractTexts.map(part => {
            // part could be a string or object like { _: "content", $: { Label: "METHODS" } }
            if (typeof part === 'string') return part;
            if (typeof part === 'object') {
                const label = part.$ && part.$.Label ? `${part.$.Label}: ` : '';
                const content = part._ || '';
                return `${label}${content}`;
            }
            return '';
        }).join('\n\n');
    }

    return 'No abstract available.';
};

// 1. Search Endpoint
app.get('/search', async (req, res) => {
    try {
        console.log('Incoming Request URL:', req.url);
        console.log('Request Query Params:', req.query);

        const { query } = req.query;
        if (!query) {
            console.error('Error: Query parameter is missing!');
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        let PUBMED_API_KEY = process.env.PUBMED_API_KEY;
        let apiKeyParam = '';

        // Only use the key if it's set and NOT the placeholder
        if (PUBMED_API_KEY && PUBMED_API_KEY !== 'YOUR_PUBMED_API_KEY_HERE') {
            apiKeyParam = `&api_key=${PUBMED_API_KEY}`;
            console.log(`Using provided API Key (length: ${PUBMED_API_KEY.length})`);
        } else {
            console.log('Using PubMed API without API Key (lower rate limits apply)');
        }

        // Step 1: Search for IDs using esearch
        const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=${encodeURIComponent(query)}${apiKeyParam}&retmax=10`;
        const searchResponse = await axios.get(esearchUrl);

        const idList = searchResponse.data.esearchresult?.idlist;

        if (!idList || idList.length === 0) {
            return res.json([]);
        }

        // Step 2: Fetch details using efetch (returns XML)
        const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${idList.join(',')}${apiKeyParam}`;
        const fetchResponse = await axios.get(efetchUrl);

        // Step 3: Parse XML
        const result = await parseStringPromise(fetchResponse.data);

        const articles = [];
        const pubmedArticles = result.PubmedArticleSet.PubmedArticle;

        if (pubmedArticles) {
            for (const article of pubmedArticles) {
                try {
                    const medline = article.MedlineCitation[0];
                    const articleData = medline.Article[0];

                    const title = cleanText(articleData.ArticleTitle);
                    const abstractText = parseAbstract(articleData.Abstract);

                    // Authors
                    let authors = [];
                    if (articleData.AuthorList && articleData.AuthorList[0].Author) {
                        authors = articleData.AuthorList[0].Author.map(a => {
                            const lastName = cleanText(a.LastName);
                            const foreName = cleanText(a.ForeName);
                            return `${lastName} ${foreName}`;
                        });
                    }

                    // Journal & Year
                    const journal = cleanText(articleData.Journal[0].Title);
                    const year = articleData.Journal[0].JournalIssue[0].PubDate[0].Year
                        ? cleanText(articleData.Journal[0].JournalIssue[0].PubDate[0].Year)
                        : 'N/A';

                    articles.push({
                        pmid: cleanText(medline.PMID),
                        title,
                        abstract: abstractText,
                        authors,
                        journal,
                        year
                    });
                } catch (err) {
                    console.error("Error parsing article", err);
                    // Skip malformed articles
                }
            }
        }

        res.json(articles);

    } catch (error) {
        console.error('Search error details:', error.message);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// 2. Summarize Endpoint
app.post('/summarize', async (req, res) => {
    try {
        const { abstract } = req.body;
        if (!abstract) {
            return res.status(400).json({ error: 'Abstract is required' });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.error('Gemini API Key is missing or invalid.');
            return res.status(503).json({
                error: 'Gemini API Key is not configured. Please add a valid key to your .env file.'
            });
        }

        // Use gemini-2.5-flash as requested by user
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Summarize the following medical abstract clearly and concisely for general understanding. Keep the summary between 50 and 100 words:\n\n${abstract}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ summary: text });

    } catch (error) {
        console.error('Summarize error:', error.message);
        let errorMessage = 'Failed to generate summary';
        if (error.message.includes('API key not valid')) {
            errorMessage = 'Invalid Gemini API Key. Please check your .env file.';
        }
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

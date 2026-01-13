import axios from 'axios';

const api = axios.create({
    // Use Render Backend URL for production
    baseURL: 'https://summarizer-e9lb.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchArticles = async (searchParams) => {
    // Support both string (legacy) and object (advanced)
    let params = {};
    if (typeof searchParams === 'string') {
        params = { query: searchParams };
    } else {
        params = searchParams;
    }

    const queryStr = new URLSearchParams(params).toString();
    const response = await api.get(`/search?${queryStr}`);
    return response.data;
};

export const summarizeArticle = async (abstract, contextParams = {}) => {
    const response = await api.post('/summarize', {
        abstract,
        ...contextParams // { query, population, intervention }
    });
    return response.data;
};

export const summarizeBulkArticles = async (articleIds, population, intervention) => {
    const response = await api.post('/summarize-bulk', {
        articleIds,
        population,
        intervention
    });
    return response.data;
};

export default api;

import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles redirection to localhost:5000
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchArticles = async (query) => {
    const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const summarizeArticle = async (abstract) => {
    const response = await api.post('/summarize', { abstract });
    return response.data;
};

export default api;

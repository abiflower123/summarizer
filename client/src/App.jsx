import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import { searchArticles } from './api';

function App() {
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (query) => {
        try {
            setLoading(true);
            setError(null);
            setSelectedArticle(null);
            const results = await searchArticles(query);
            setArticles(results);
            if (results.length === 0) {
                setError('No articles found matching your query.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during search. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Medical Research AI Agent</h1>

            <SearchBar onSearch={handleSearch} isLoading={loading} />

            {error && (
                <div style={{ textAlign: 'center', color: '#ef4444', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="content-grid">
                <div className="left-panel">
                    {loading ? (
                        <div className="loading">Searching PubMed...</div>
                    ) : (
                        <ArticleList
                            articles={articles}
                            onSelect={setSelectedArticle}
                            selectedArticleId={selectedArticle?.pmid}
                        />
                    )}
                </div>

                <div className="right-panel">
                    <ArticleDetail article={selectedArticle} />
                </div>
            </div>
        </div>
    );
}

export default App;

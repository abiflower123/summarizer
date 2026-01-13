import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import { searchArticles, summarizeBulkArticles } from './api';
import ReactMarkdown from 'react-markdown';

function App() {
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Advanced State
    const [searchParams, setSearchParams] = useState({}); // { query, population, intervention }
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkSummary, setBulkSummary] = useState(null);
    const [isBulkSummarizing, setIsBulkSummarizing] = useState(false);

    const handleSearch = async (params) => {
        try {
            setLoading(true);
            setError(null);
            setSelectedArticle(null);
            setBulkSummary(null);
            setSelectedIds(new Set());
            setSearchParams(params); // Store for context

            const results = await searchArticles(params);
            setArticles(results);

            // Auto-select Top 5 by default
            const initialSelection = new Set(results.slice(0, 5).map(a => a.pmid));
            setSelectedIds(initialSelection);

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

    const handleToggleId = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Helper to perform the actual API call
    const performBulkSummarize = async (ids) => {
        try {
            setIsBulkSummarizing(true);
            setError(null);

            const { population, intervention } = searchParams;
            const result = await summarizeBulkArticles(
                ids,
                population,
                intervention
            );

            setBulkSummary(result.summary);
            setSelectedArticle(null);
        } catch (err) {
            console.error(err);
            setError('Failed to generate bulk summary.');
        } finally {
            setIsBulkSummarizing(false);
        }
    };

    // 1. Manual "Get Summary" button click
    const handleManualBulkSummarize = () => {
        performBulkSummarize(Array.from(selectedIds));
    };

    // 2. "Top X" Quick Action (Selects & Summarizes immediately)
    const handleQuickSummarize = (count) => {
        const topArticles = articles.slice(0, count);
        if (topArticles.length === 0) return;

        const topIds = topArticles.map(a => a.pmid);

        // 1. Visually update selection immediately
        setSelectedIds(new Set(topIds));

        // 2. Trigger summary immediately
        performBulkSummarize(topIds);
    };

    const handleSingleSelect = (article) => {
        setSelectedArticle(article);
        setBulkSummary(null); // Clear bulk summary when viewing single article
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
                            onSelect={handleSingleSelect}
                            selectedArticleId={selectedArticle?.pmid}
                            selectedIds={selectedIds}
                            onToggleId={handleToggleId}
                            onBulkSummarize={handleManualBulkSummarize}
                            onQuickSummarize={handleQuickSummarize}
                        />
                    )}
                </div>

                <div className="right-panel">
                    {isBulkSummarizing && (
                        <div className="loading">Synthesizing {selectedIds.size} articles...</div>
                    )}

                    {!isBulkSummarizing && bulkSummary && (
                        <div className="article-detail">
                            <h2 className="detail-title">Research Synthesis</h2>
                            <div className="detail-authors">
                                Based on {selectedIds.size} selected articles
                                {searchParams.population && <span> • Population: {searchParams.population}</span>}
                                {searchParams.intervention && <span> • Intervention: {searchParams.intervention}</span>}
                            </div>
                            <div className="summary-box">
                                <h3 className="detail-heading">Consolidated AI Summary</h3>
                                <div className="summary-content">
                                    <ReactMarkdown>{bulkSummary}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isBulkSummarizing && !bulkSummary && (
                        <ArticleDetail
                            article={selectedArticle}
                            searchParams={searchParams}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;

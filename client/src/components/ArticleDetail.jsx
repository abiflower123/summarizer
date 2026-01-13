import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { summarizeArticle } from '../api';

const ArticleDetail = ({ article }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset summary when article changes
    useEffect(() => {
        setSummary(null);
        setError(null);
    }, [article]);

    const handleSummarize = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await summarizeArticle(article.abstract);
            setSummary(data.summary);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || 'Failed to generate summary. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!article) {
        return (
            <div className="empty-state">
                <p>Select an article to view details</p>
            </div>
        );
    }

    return (
        <div className="article-detail">
            <h2 className="detail-title">{article.title}</h2>

            <div className="detail-authors">
                <strong>Authors:</strong> {article.authors ? article.authors.join(', ') : 'Unknown'}
            </div>

            <div className="detail-section">
                <h4 className="detail-heading">Abstract</h4>
                <p className="abstract-text">{article.abstract}</p>
            </div>

            {!summary && (
                <button
                    className="summarize-btn"
                    onClick={handleSummarize}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            Generating Summary...
                        </>
                    ) : (
                        <>
                            ✨ Generate AI Summary
                        </>
                    )}
                </button>
            )}

            {error && (
                <div style={{ marginTop: '1rem', color: '#ef4444' }}>
                    {error}
                </div>
            )}

            {summary && (
                <div className="summary-box">
                    <h4 className="detail-heading" style={{ color: '#166534' }}>
                        AI Summary (by Gemini)
                    </h4>
                    <div className="summary-content">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleDetail;

import React from 'react';

const ArticleList = ({
    articles,
    onSelect,
    selectedArticleId,
    selectedIds,
    onToggleId,
    onBulkSummarize,
    onQuickSummarize
}) => {
    if (!articles) return null;

    // "Top 5" just selects (doesn't auto-summarize), or we can make it auto-summarize too?
    // User asked "if click top 2 automatically select top2 and summarize it... and similar for top 3"
    // User also said "defaultly provides the summarize for top 5 articles" (which is the default selection).
    // Let's make Top 2 and Top 3 immediate actions. Top 5 can be a selection helper or instant too.
    // Based on "similar for top 3", instant action seems preferred for these buttons.

    // However, the requested flow "at initailly dispaly default summary of 5 articles" refers to the default selection state.
    // Let's make Top 2 and Top 3 "Quick Summarize" buttons.

    return (
        <div className="article-list-container">
            {articles.length > 0 && (
                <div className="bulk-actions">
                    <div className="bulk-stats">
                        <span className="bulk-label">Summarize Top:</span>
                        <div className="quick-select">
                            <button onClick={() => onQuickSummarize(2)} className="select-box">Top 2</button>
                            <button onClick={() => onQuickSummarize(3)} className="select-box">Top 3</button>
                        </div>
                    </div>
                    <button
                        className="bulk-btn"
                        onClick={onBulkSummarize}
                        disabled={selectedIds.size === 0}
                    >
                        Get Summary ({selectedIds.size})
                    </button>
                </div>
            )}

            <div className="article-list">
                {articles.map((article) => {
                    const isSelected = selectedIds.has(article.pmid);
                    return (
                        <div
                            key={article.pmid}
                            className={`article-card ${selectedArticleId === article.pmid ? 'active' : ''}`}
                            onClick={() => onSelect(article)}
                        >
                            <div className="card-header">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleId(article.pmid);
                                    }}
                                    onChange={() => { }} // handled by onClick
                                    className="article-checkbox"
                                />
                                <h3 className="article-title">{article.title}</h3>
                            </div>
                            <div className="article-meta">
                                <span>{article.journal}</span>
                                <span>•</span>
                                <span>{article.year}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ArticleList;

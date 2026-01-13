import React from 'react';

const ArticleList = ({ articles, onSelect, selectedArticleId }) => {
    if (!articles) return null;

    return (
        <div className="article-list">
            {articles.map((article) => (
                <div
                    key={article.pmid}
                    className={`article-card ${selectedArticleId === article.pmid ? 'active' : ''}`}
                    onClick={() => onSelect(article)}
                >
                    <h3 className="article-title">{article.title}</h3>
                    <div className="article-meta">
                        <span>{article.journal}</span>
                        <span>•</span>
                        <span>{article.year}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ArticleList;

import React, { useState } from 'react';

const SearchBar = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form className="search-container" onSubmit={handleSubmit}>
            <input
                type="text"
                className="search-input"
                placeholder="Search medical topics (e.g., 'covid-19 vaccines')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
            />
            <button type="submit" className="search-button" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    );
};

export default SearchBar;

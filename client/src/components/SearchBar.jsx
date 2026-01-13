import React, { useState } from 'react';

const SearchBar = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [population, setPopulation] = useState('');
    const [intervention, setIntervention] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            // Pass object with advanced fields
            onSearch({
                query,
                population: population.trim(),
                intervention: intervention.trim()
            });
        }
    };

    return (
        <form className="search-container-wrapper" onSubmit={handleSubmit}>
            <div className="search-container">
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
            </div>

            <div className="advanced-toggle">
                <button
                    type="button"
                    className="text-link"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Population/Intervention)'}
                </button>
            </div>

            {showAdvanced && (
                <div className="advanced-filters">
                    <input
                        type="text"
                        className="advanced-input"
                        placeholder="Population (Optional) e.g. 'Patients with Diabetes'"
                        value={population}
                        onChange={(e) => setPopulation(e.target.value)}
                    />
                    <input
                        type="text"
                        className="advanced-input"
                        placeholder="Intervention (Optional) e.g. 'Metformin'"
                        value={intervention}
                        onChange={(e) => setIntervention(e.target.value)}
                    />
                </div>
            )}
        </form>
    );
};

export default SearchBar;

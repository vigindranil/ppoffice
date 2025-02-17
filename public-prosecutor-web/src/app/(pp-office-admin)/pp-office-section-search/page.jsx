import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(handleSearch, 500); // 500ms delay

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value); // Call debounced search
  };

  async function handleSearch(term) {
    if (!term) { // If search term is empty, clear results
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}showBnsSection`, { searchTerm: term });

      if (response.data.status === 1) {
        setSearchResults(response.data.data);
      } else {
        setError(response.data.message);
        setSearchResults([]); // Clear results on error
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred during search.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange} // Call handleInputChange on every input change
      />
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {searchResults.map((result) => (
          <li key={result.bnsId}>{result.bnsSection}</li>
        ))}
      </ul>
    </div>
  );
};

// Custom debounce hook
function useDebounce(func, delay) {
  const [debouncedFunction] = useState(() => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  return debouncedFunction;
}

export default SearchComponent;
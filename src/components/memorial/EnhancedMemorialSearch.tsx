'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchFilters } from '@/lib/search';

// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  }) as T;
}

interface SearchFacets {
  funeralHomes: { name: string; count: number }[];
  locations: { location: string; count: number }[];
  years: { year: number; count: number }[];
  tags: { tag: string; count: number }[];
}

interface SearchSuggestion {
  text: string;
  type: 'query' | 'location' | 'name' | 'tag';
  count?: number;
}

interface EnhancedMemorialSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onFacetsUpdate?: (facets: SearchFacets) => void;
  initialQuery?: string;
  showAdvanced?: boolean;
}

export default function EnhancedMemorialSearch({ 
  onSearch, 
  onFacetsUpdate,
  initialQuery = '',
  showAdvanced = true 
}: EnhancedMemorialSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [facets, setFacets] = useState<SearchFacets>({
    funeralHomes: [],
    locations: [],
    years: [],
    tags: []
  });
  
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: {},
    location: {},
    tags: [],
    sortBy: 'relevance',
    limit: 20,
    offset: 0
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, searchFilters: SearchFilters) => {
      try {
        // Perform search and get results with facets
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            filters: searchFilters,
            advanced: true,
            options: { synonyms: true, fuzzyMatch: true }
          })
        });
        
        const results = await response.json();
        
        if (results.facets) {
          setFacets(results.facets);
          onFacetsUpdate?.(results.facets);
        }
        
        onSearch(query, searchFilters);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300),
    [onSearch, onFacetsUpdate]
  );

  // Auto-complete suggestions
  const debouncedSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Suggestions error:', error);
        setSuggestions([]);
      }
    }, 200),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(true);
    
    if (value.trim()) {
      debouncedSuggestions(value);
      debouncedSearch(value, filters);
    } else {
      setSuggestions([]);
      debouncedSearch('', filters);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    debouncedSearch(suggestion.text, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedSearch(searchTerm, newFilters);
  };

  const handleFacetClick = (facetType: string, value: string) => {
    let newFilters = { ...filters };
    
    switch (facetType) {
      case 'funeralHome':
        newFilters.funeralHome = newFilters.funeralHome === value ? undefined : value;
        break;
      case 'location':
        if (value.includes(',')) {
          const [city, state] = value.split(',').map(s => s.trim());
          newFilters.location = { city, state };
        } else {
          newFilters.location = { city: value };
        }
        break;
      case 'year':
        const year = parseInt(value);
        newFilters.dateRange = {
          start: `${year}-01-01`,
          end: `${year}-12-31`
        };
        break;
      case 'tag':
        const currentTags = newFilters.tags || [];
        const tagIndex = currentTags.indexOf(value);
        if (tagIndex > -1) {
          newFilters.tags = currentTags.filter(t => t !== value);
        } else {
          newFilters.tags = [...currentTags, value];
        }
        break;
    }
    
    setFilters(newFilters);
    debouncedSearch(searchTerm, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      sortBy: 'relevance',
      limit: 20,
      offset: 0
    };
    setFilters(clearedFilters);
    debouncedSearch(searchTerm, clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.funeralHome) count++;
    if (filters.location?.city || filters.location?.state) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    if (filters.mediaType) count++;
    return count;
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-granite-200 p-6 space-y-6">
      {/* Search Input with Suggestions */}
      <div className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search memorials by name, location, or keyword..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="w-full px-4 py-3 pl-10 pr-4 text-lg border border-granite-300 rounded-lg focus:ring-2 focus:ring-copper-500 focus:border-copper-500 transition-colors"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-granite-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-white border border-granite-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-granite-50 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    suggestion.type === 'query' ? 'bg-copper-500' :
                    suggestion.type === 'location' ? 'bg-blue-500' :
                    suggestion.type === 'name' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="text-granite-900">{suggestion.text}</span>
                </div>
                {suggestion.count && (
                  <span className="text-xs text-granite-500">{suggestion.count} results</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters & Sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-granite-700">Sort by:</span>
          <select
            value={filters.sortBy || 'relevance'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-1 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
          >
            <option value="relevance">Relevance</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-granite-700">Media:</span>
          <select
            value={filters.mediaType || ''}
            onChange={(e) => handleFilterChange('mediaType', e.target.value || undefined)}
            className="px-3 py-1 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
          >
            <option value="">All Types</option>
            <option value="photos">Photos</option>
            <option value="videos">Videos</option>
            <option value="audio">Audio</option>
            <option value="documents">Documents</option>
          </select>
        </div>

        {showAdvanced && (
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`px-3 py-1 text-sm border rounded transition-colors ${
              isAdvancedOpen 
                ? 'bg-copper-100 border-copper-300 text-copper-700' 
                : 'border-granite-300 text-granite-700 hover:bg-granite-50'
            }`}
          >
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-copper-500 text-white rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        )}

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-copper-600 hover:text-copper-700 border border-copper-300 rounded hover:bg-copper-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t border-granite-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-granite-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
                />
                <input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-granite-700 mb-2">Location</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="City"
                  value={filters.location?.city || ''}
                  onChange={(e) => handleFilterChange('location', { ...filters.location, city: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={filters.location?.state || ''}
                  onChange={(e) => handleFilterChange('location', { ...filters.location, state: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-granite-700 mb-2">Tags</label>
              <input
                type="text"
                placeholder="Add tags (comma separated)"
                value={filters.tags?.join(', ') || ''}
                onChange={(e) => handleFilterChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full px-3 py-2 text-sm border border-granite-300 rounded focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Facets */}
      <div className="border-t border-granite-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Years Facet */}
          {facets.years.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-granite-900 mb-3">Years</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {facets.years.slice(0, 10).map(({ year, count }) => (
                  <button
                    key={year}
                    onClick={() => handleFacetClick('year', year.toString())}
                    className="w-full flex items-center justify-between text-left px-2 py-1 text-sm rounded hover:bg-granite-50 transition-colors"
                  >
                    <span className="text-granite-700">{year}</span>
                    <span className="text-granite-500 text-xs">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locations Facet */}
          {facets.locations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-granite-900 mb-3">Locations</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {facets.locations.slice(0, 10).map(({ location, count }) => (
                  <button
                    key={location}
                    onClick={() => handleFacetClick('location', location)}
                    className="w-full flex items-center justify-between text-left px-2 py-1 text-sm rounded hover:bg-granite-50 transition-colors"
                  >
                    <span className="text-granite-700 truncate">{location}</span>
                    <span className="text-granite-500 text-xs">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Facet */}
          {facets.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-granite-900 mb-3">Tags</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {facets.tags.slice(0, 10).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => handleFacetClick('tag', tag)}
                    className={`w-full flex items-center justify-between text-left px-2 py-1 text-sm rounded transition-colors ${
                      filters.tags?.includes(tag) 
                        ? 'bg-copper-100 text-copper-700' 
                        : 'hover:bg-granite-50 text-granite-700'
                    }`}
                  >
                    <span className="truncate">{tag}</span>
                    <span className="text-granite-500 text-xs">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Funeral Homes Facet */}
          {facets.funeralHomes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-granite-900 mb-3">Funeral Homes</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {facets.funeralHomes.slice(0, 10).map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => handleFacetClick('funeralHome', name)}
                    className={`w-full flex items-center justify-between text-left px-2 py-1 text-sm rounded transition-colors ${
                      filters.funeralHome === name 
                        ? 'bg-copper-100 text-copper-700' 
                        : 'hover:bg-granite-50 text-granite-700'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span className="text-granite-500 text-xs">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
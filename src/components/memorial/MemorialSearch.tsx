'use client';

import { useState } from 'react';
import { SearchFilters } from '@/types/memorial';

interface MemorialSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

export function MemorialSearch({ onSearch }: MemorialSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    yearRange: 'all',
    hasPhotos: false,
    hasStories: false,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(searchTerm, newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search memorials..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-copper-500 focus:border-copper-500"
        />
        <select
          value={filters.yearRange}
          onChange={(e) => handleFilterChange('yearRange', e.target.value as SearchFilters['yearRange'])}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-copper-500 focus:border-copper-500"
        >
          <option value="all">All Time</option>
          <option value="recent">Last Year</option>
          <option value="old">Older</option>
        </select>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasPhotos}
            onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-copper-500 focus:ring-copper-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Has Photos</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasStories}
            onChange={(e) => handleFilterChange('hasStories', e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-copper-500 focus:ring-copper-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Has Stories</span>
        </label>
      </div>
    </div>
  );
} 
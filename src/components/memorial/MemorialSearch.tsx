'use client';

import { useState, useMemo } from 'react';
import { Memorial } from '@/types/memorial';
import MemorialCard from '@/components/MemorialCard';

interface MemorialSearchProps {
  memorials: Memorial[];
}

export default function MemorialSearch({ memorials }: MemorialSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter and search memorials
  const filteredMemorials = useMemo(() => {
    let filtered = memorials;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(memorial => 
        memorial.name?.toLowerCase().includes(searchLower) ||
        memorial.title?.toLowerCase().includes(searchLower) ||
        memorial.description?.toLowerCase().includes(searchLower) ||
        memorial.subtitle?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      const now = new Date();
      switch (selectedFilter) {
        case 'recent':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          filtered = filtered.filter(memorial => {
            const createdAt = new Date(memorial._createdAt);
            return createdAt > thirtyDaysAgo;
          });
          break;
        case 'thisYear':
          const thisYear = now.getFullYear();
          filtered = filtered.filter(memorial => {
            const diedDate = memorial.died || memorial.personalInfo?.dateOfDeath;
            if (diedDate) {
              const year = new Date(diedDate).getFullYear();
              return year === thisYear;
            }
            return false;
          });
          break;
        case 'hasPhotos':
          filtered = filtered.filter(memorial => 
            memorial.coverImage?.url || 
            (memorial.gallery && memorial.gallery.length > 0)
          );
          break;
      }
    }

    return filtered;
  }, [memorials, searchTerm, selectedFilter]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-pearl-50 dark:bg-granite-800 p-6 rounded-lg shadow-sm border border-pearl-200 dark:border-granite-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Sök minneslundar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Sök minneslundar efter namn, beskrivning..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-pearl-300 dark:border-granite-600 rounded-md leading-5 bg-pearl-50 dark:bg-granite-700 text-granite-900 dark:text-pearl-100 placeholder-granite-500 focus:outline-none focus:placeholder-granite-400 focus:ring-1 focus:ring-serenity-500 focus:border-serenity-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="w-full md:w-48">
            <label htmlFor="filter" className="sr-only">
              Filtrera minneslundar
            </label>
            <select
              id="filter"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-pearl-300 dark:border-granite-600 rounded-md bg-pearl-50 dark:bg-granite-700 text-granite-900 dark:text-pearl-100 focus:outline-none focus:ring-1 focus:ring-serenity-500 focus:border-serenity-500"
            >
              <option value="all">Alla Minneslundar</option>
              <option value="recent">Senaste (30 dagar)</option>
              <option value="thisYear">Detta År</option>
              <option value="hasPhotos">Med Foton</option>
            </select>
          </div>
        </div>

        {/* Search Results Count */}
        {(searchTerm || selectedFilter !== 'all') && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {filteredMemorials.length === 0 ? (
              `Inga resultat hittades för "${searchTerm}"`
            ) : (
              `Visar ${filteredMemorials.length} av ${memorials.length} minneslundar`
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {filteredMemorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMemorials.map((memorial: Memorial) => (
            <MemorialCard key={memorial._id} memorial={memorial} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Inga Resultat Hittades' : 'Inga Minneslundar Ännu'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchTerm ? 'Försök justera dina söktermer eller filter.' : 'Bli den första att skapa en minneslund och hedra någon speciell.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-serenity-600 bg-serenity-100 hover:bg-serenity-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-serenity-500"
            >
              Rensa Sökning
            </button>
          )}
        </div>
      )}
    </div>
  );
} 
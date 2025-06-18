'use client';

import { useState, useMemo, useEffect } from 'react';
import { client } from '@/lib/sanity';
import { mockMemorials } from '@/lib/mock-memorials';
import Link from 'next/link';
import { Memorial, SearchFilters } from '@/types/memorial';
import { MemorialSearch } from '@/components/memorial/MemorialSearch';

export default function ExploreMemorials() {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    yearRange: 'all',
    hasPhotos: false,
    hasStories: false,
  });

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const query = `*[_type == "memorial" && status == "published"] {
          _id,
          name,
          description,
          slug,
          born,
          died,
          bornAt,
          diedAt,
          _createdAt,
          _updatedAt,
          status,
          gallery,
          storyBlocks
        }`;
        
        const result = await client.fetch(query);
        console.log('Fetched memorials:', result);
        
        if (result.length === 0) {
          console.log('No memorials found in Sanity, using mock data');
          setMemorials(mockMemorials);
          setUsingMockData(true);
          return;
        }
        
        // Transform the data to match the expected interface
        const transformedMemorials = result.map((memorial: any) => ({
          ...memorial,
          title: memorial.name, // Map name to title for backwards compatibility
          subtitle: memorial.description, // Map description to subtitle
          createdAt: memorial._createdAt,
          updatedAt: memorial._updatedAt
        }));
        
        setMemorials(transformedMemorials);
        setUsingMockData(false);
      } catch (err) {
        console.error('Error fetching memorials:', err);
        console.log('Falling back to mock data due to error');
        setMemorials(mockMemorials);
        setUsingMockData(true);
        setError('Using demo data. Configure Sanity to see real memorials.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemorials();
  }, []);

  const filteredMemorials = useMemo(() => {
    console.log('Filtering memorials:', {
      totalMemorials: memorials.length,
      searchQuery,
      filters
    });
    
    return memorials.filter((memorial: Memorial) => {
      // Use both title (transformed from name) and name for search
      const searchableText = [
        memorial.title?.toLowerCase() || '',
        memorial.name?.toLowerCase() || '',
        memorial.subtitle?.toLowerCase() || '',
        memorial.description?.toLowerCase() || ''
      ].join(' ');
      
      const matchesSearch = !searchQuery || searchableText.includes(searchQuery.toLowerCase());
      
      console.log('Memorial search match:', {
        title: memorial.title || memorial.name,
        matchesSearch,
        searchQuery,
        searchableText: searchableText.slice(0, 100)
      });
      
      const matchesYearRange = filters.yearRange === 'all' ||
        (filters.yearRange === 'recent' && new Date(memorial.createdAt).getFullYear() >= new Date().getFullYear() - 1) ||
        (filters.yearRange === 'old' && new Date(memorial.createdAt).getFullYear() < new Date().getFullYear() - 1);

      const matchesPhotos = !filters.hasPhotos || (memorial.gallery && memorial.gallery.length > 0);
      const matchesStories = !filters.hasStories || (memorial.storyBlocks && memorial.storyBlocks.length > 0);

      return matchesSearch && matchesYearRange && matchesPhotos && matchesStories;
    });
  }, [memorials, searchQuery, filters]);

  const handleSearch = (query: string, newFilters: SearchFilters) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading memorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Explore Memorials</h1>
      
      {usingMockData && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>Demo Mode:</strong> Showing sample memorials. Configure Sanity CMS to see real data.
            {error && (
              <span className="block mt-1 text-sm">{error}</span>
            )}
          </p>
        </div>
      )}
      
      <MemorialSearch onSearch={handleSearch} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredMemorials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery ? 'No memorials found matching your search.' : 'No memorials available yet.'}
            </p>
            {memorials.length === 0 && !usingMockData && (
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Create some memorials in the Sanity Studio at /studio to see them here.
              </p>
            )}
          </div>
        ) : (
          filteredMemorials.map((memorial: Memorial) => (
            <Link 
              key={memorial._id} 
              href={`/memorial/${memorial.slug.current}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{memorial.title || memorial.name}</h2>
                {(memorial.subtitle || memorial.description) && (
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {memorial.subtitle || memorial.description}
                  </p>
                )}
                {memorial.bornAt && memorial.diedAt && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {memorial.bornAt.location} - {memorial.diedAt.location}
                  </p>
                )}
                {memorial.born && memorial.died && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {memorial.born} - {memorial.died}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 
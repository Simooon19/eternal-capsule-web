'use client';

import { useState, useMemo, useEffect } from 'react';
import { client } from '@/lib/sanity';
import Link from 'next/link';
import { Memorial, SearchFilters } from '@/types/memorial';
import { MemorialSearch } from '@/components/memorial/MemorialSearch';

export default function ExploreMemorials() {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          title,
          subtitle,
          slug,
          bornAt,
          diedAt,
          createdAt,
          updatedAt,
          status
        }`;
        
        const result = await client.fetch(query);
        console.log('Fetched memorials:', result);
        setMemorials(result);
      } catch (err) {
        console.error('Error fetching memorials:', err);
        setError('Failed to load memorials. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemorials();
  }, []);

  const filteredMemorials = useMemo(() => {
    return memorials.filter((memorial: Memorial) => {
      const matchesSearch = memorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (memorial.subtitle && memorial.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesYearRange = filters.yearRange === 'all' ||
        (filters.yearRange === 'recent' && new Date(memorial.createdAt).getFullYear() >= new Date().getFullYear() - 1) ||
        (filters.yearRange === 'old' && new Date(memorial.createdAt).getFullYear() < new Date().getFullYear() - 1);

      const matchesPhotos = !filters.hasPhotos || memorial.gallery.length > 0;
      const matchesStories = !filters.hasStories || memorial.storyBlocks.length > 0;

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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Explore Memorials</h1>
      
      <MemorialSearch onSearch={handleSearch} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredMemorials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery ? 'No memorials found matching your search.' : 'No memorials available yet.'}
            </p>
          </div>
        ) : (
          filteredMemorials.map((memorial: Memorial) => (
            <Link 
              key={memorial._id} 
              href={`/memorial/${memorial.slug.current}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{memorial.title}</h2>
                {memorial.subtitle && (
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{memorial.subtitle}</p>
                )}
                {memorial.bornAt && memorial.diedAt && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {memorial.bornAt.location} - {memorial.diedAt.location}
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
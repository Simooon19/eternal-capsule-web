'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SearchResult } from '@/lib/search';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface SearchResultsProps {
  results: SearchResult[];
  total: number;
  query: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function SearchResults({ 
  results, 
  total, 
  query, 
  loading = false, 
  onLoadMore,
  hasMore = false 
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  if (loading && results.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-granite-200 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-granite-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-granite-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-granite-900 mb-2">No memorials found</h3>
        <p className="text-granite-600 mb-6">
          {query 
            ? `We couldn't find any memorials matching "${query}". Try adjusting your search terms or filters.`
            : 'No memorials match your current filters. Try adjusting your criteria.'
          }
        </p>
        <div className="space-y-2 text-sm text-granite-500">
          <p>Tips for better results:</p>
          <ul className="list-disc list-inside space-y-1 max-w-md mx-auto">
            <li>Try broader search terms</li>
            <li>Check spelling of names and locations</li>
            <li>Remove some filters</li>
            <li>Search for partial names or nicknames</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-granite-900">
            {total.toLocaleString()} memorial{total !== 1 ? 's' : ''} found
            {query && (
              <span className="ml-2 text-granite-600 font-normal">
                for "{query}"
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-granite-600">View:</span>
          <div className="flex border border-granite-300 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-copper-100 text-copper-700' 
                  : 'text-granite-600 hover:bg-granite-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-r-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-copper-100 text-copper-700' 
                  : 'text-granite-600 hover:bg-granite-50'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'list' ? (
                 <div className="space-y-4">
           {results.map((result) => (
             <SearchResultCard key={result.memorial.slug.current} result={result} query={query} mode="list" />
           ))}
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {results.map((result) => (
             <SearchResultCard key={result.memorial.slug.current} result={result} query={query} mode="grid" />
           ))}
         </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-copper-600 text-white rounded-lg hover:bg-copper-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load More Results'}
          </button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && results.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-copper-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-granite-600">Loading more results...</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  mode: 'list' | 'grid';
}

function SearchResultCard({ result, query, mode }: SearchResultCardProps) {
  const { memorial, score, highlights } = result;

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const terms = searchQuery.trim().split(/\s+/);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (mode === 'grid') {
    return (
      <Link href={`/memorial/${memorial.slug}`} className="block group">
        <div className="bg-white border border-granite-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                     {/* Image */}
           <div className="aspect-w-16 aspect-h-9 bg-granite-100">
             {memorial.coverImage ? (
               <OptimizedImage
                 src={memorial.coverImage.url}
                 alt={memorial.name}
                 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
               />
             ) : (
               <div className="w-full h-48 bg-gradient-to-br from-granite-100 to-granite-200 flex items-center justify-center">
                 <svg className="w-16 h-16 text-granite-400" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                 </svg>
               </div>
             )}
           </div>

           {/* Content */}
           <div className="p-4">
             <h3 className="text-lg font-semibold text-granite-900 mb-1 group-hover:text-copper-600 transition-colors">
               <span dangerouslySetInnerHTML={{ __html: highlightText(memorial.name, query) }} />
             </h3>
             
             {memorial.born && memorial.died && (
               <p className="text-sm text-granite-600 mb-2">
                 {formatDate(memorial.born)} - {formatDate(memorial.died)}
               </p>
             )}

             {memorial.bornAt?.location && (
               <p className="text-sm text-granite-500 mb-3">
                 <span dangerouslySetInnerHTML={{ 
                   __html: highlightText(memorial.bornAt.location, query) 
                 }} />
               </p>
             )}

            {highlights && highlights.length > 0 && (
              <div className="text-sm text-granite-600">
                <span dangerouslySetInnerHTML={{ __html: highlights[0].snippet }} />
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/memorial/${memorial.slug}`} className="block group">
      <div className="bg-white border border-granite-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex space-x-4">
          {/* Image */}
                   <div className="flex-shrink-0">
           <div className="w-16 h-16 rounded-full overflow-hidden bg-granite-100">
             {memorial.coverImage ? (
               <OptimizedImage
                 src={memorial.coverImage.url}
                 alt={memorial.name}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-granite-100 to-granite-200 flex items-center justify-center">
                 <svg className="w-8 h-8 text-granite-400" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                 </svg>
               </div>
             )}
           </div>
         </div>

         {/* Content */}
         <div className="flex-1 min-w-0">
           <div className="flex items-start justify-between">
             <div className="flex-1 min-w-0">
               <h3 className="text-lg font-semibold text-granite-900 mb-1 group-hover:text-copper-600 transition-colors">
                 <span dangerouslySetInnerHTML={{ __html: highlightText(memorial.name, query) }} />
               </h3>
               
               <div className="flex items-center space-x-4 text-sm text-granite-600 mb-3">
                 {memorial.born && memorial.died && (
                   <span>
                     {formatDate(memorial.born)} - {formatDate(memorial.died)}
                   </span>
                 )}
                 
                 {memorial.bornAt?.location && (
                   <span>
                     <span dangerouslySetInnerHTML={{ 
                       __html: highlightText(memorial.bornAt.location, query) 
                     }} />
                   </span>
                 )}
               </div>

                {highlights && highlights.length > 0 && (
                  <div className="text-sm text-granite-600 mb-3">
                    <span dangerouslySetInnerHTML={{ __html: highlights[0].snippet }} />
                  </div>
                )}

                {memorial.tags && memorial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {memorial.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-granite-100 text-granite-700 rounded">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(tag, query) }} />
                      </span>
                    ))}
                    {memorial.tags.length > 3 && (
                      <span className="text-xs text-granite-500">+{memorial.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Score indicator */}
              <div className="flex-shrink-0 ml-4">
                <div className={`w-2 h-8 rounded-full ${
                  score >= 0.8 ? 'bg-green-400' :
                  score >= 0.6 ? 'bg-yellow-400' :
                  score >= 0.4 ? 'bg-orange-400' :
                  'bg-red-400'
                }`} title={`Relevance: ${Math.round(score * 100)}%`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 
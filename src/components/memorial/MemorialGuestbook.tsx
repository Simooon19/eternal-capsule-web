'use client'

import React, { useState, useEffect } from 'react';
import { GuestbookEntry } from '@/types/memorial';
import AddGuestbookEntry from '@/components/memorial/AddGuestbookEntry';
import GuestbookReactions from '@/components/memorial/GuestbookReactions';

interface MemorialGuestbookProps {
  memorialId: string;
  initialEntries?: GuestbookEntry[];
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'reactions';

export function MemorialGuestbook({ 
  memorialId, 
  initialEntries = [],
  className = "" 
}: MemorialGuestbookProps) {
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Fetch guestbook entries from the API
  const fetchGuestbookEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In development, show all entries; in production, show only approved
      const status = process.env.NODE_ENV === 'development' ? 'all' : 'approved';
      const response = await fetch(`/api/guestbook?memorialId=${encodeURIComponent(memorialId)}&status=${status}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to load guestbook entries');
      }
      
              if (process.env.NODE_ENV === 'development') {
          console.log('📋 Guestbook API Response:', result);
        }
      
      setGuestbookEntries(result.entries || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching guestbook entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load guestbook entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Load entries on component mount and when memorialId changes
  useEffect(() => {
    if (memorialId) {
      // Always fetch to get the latest data, even if we have initial entries
      fetchGuestbookEntries();
    }
  }, [memorialId]);

  const handleEntryAdded = async () => {
    // Refresh the guestbook entries after a new entry is added
          if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Refreshing guestbook entries after new submission...');
      }
    await fetchGuestbookEntries();
  };

  const handleReactionAdd = async (entryId: string, emoji: string, action: 'add' | 'remove' = 'add') => {
    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryId, emoji, action }),
      });

      const result = await response.json();

      if (response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Reaction ${action}ed successfully`);
        }
        // Refresh entries to get updated reactions
        await fetchGuestbookEntries();
      } else {
        console.error(`Failed to ${action} reaction:`, result.error?.message);
        throw new Error(result.error?.message || `Failed to ${action} reaction`);
      }
    } catch (error) {
      console.error(`Error ${action}ing reaction:`, error);
      throw error; // Re-throw so the reaction component can handle it
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use a consistent format that works on both server and client
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      // Fallback for invalid dates
      return 'Ogiltigt datum';
    }
  };

  // Helper function to calculate total reactions for an entry
  const getTotalReactions = (entry: GuestbookEntry) => {
    if (!entry.reactions) return 0;
    return entry.reactions.reduce((total, reaction) => total + reaction.count, 0);
  };

  // Sort guestbook entries based on selected sort option
  const getSortedEntries = () => {
    const entries = [...guestbookEntries];
    
    switch (sortBy) {
      case 'oldest':
        return entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      case 'reactions':
        return entries.sort((a, b) => {
          const reactionsA = getTotalReactions(a);
          const reactionsB = getTotalReactions(b);
          // If reactions are equal, sort by newest first
          if (reactionsA === reactionsB) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return reactionsB - reactionsA;
        });
      
      case 'newest':
      default:
        return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-granite-900 dark:text-pearl-100">Gästbok</h2>
        
        {/* Sort options - Enhanced styling */}
        {guestbookEntries.length > 1 && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-serenity-500 dark:text-serenity-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <label htmlFor="sort-select" className="text-sm text-granite-600 dark:text-pearl-400">
              Sortera efter:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm px-3 py-1.5 border border-pearl-300 dark:border-granite-600 rounded-md bg-pearl-50 dark:bg-granite-700 text-granite-900 dark:text-pearl-100 focus:outline-none focus:ring-2 focus:ring-serenity-500 focus:border-serenity-500 transition-colors"
            >
              <option value="newest">📅 Nyaste först</option>
              <option value="oldest">📅 Äldsta först</option>
              <option value="reactions">❤️ Flest reaktioner</option>
            </select>
          </div>
        )}
      </div>
      
      <AddGuestbookEntry 
        memorialId={memorialId} 
        onEntryAdded={handleEntryAdded} 
      />
      
      <div className="mt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <button 
              onClick={fetchGuestbookEntries}
              className="mt-2 text-sm underline hover:no-underline transition-colors duration-200"
            >
              Försök igen
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-serenity-600 mx-auto"></div>
            <p className="mt-2 text-granite-500 dark:text-pearl-400">Laddar meddelanden...</p>
          </div>
        ) : guestbookEntries.length > 0 ? (
          <div className="space-y-6">
            {getSortedEntries().map((entry) => (
              <article 
                key={entry._id} 
                className={`bg-pearl-50 dark:bg-granite-800 p-6 rounded-lg shadow-sm border border-pearl-200 dark:border-granite-700 hover:border-serenity-200 dark:hover:border-serenity-600 transition-all duration-300 ${
                  entry.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''
                } ${
                  entry.status === 'rejected' ? 'border-l-4 border-l-red-400 opacity-75' : ''
                }`}
              >
                <header className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-granite-900 dark:text-pearl-100">
                    {entry.author}
                  </h3>
                  <time className="text-sm text-granite-500 dark:text-pearl-400">
                    {formatDate(entry.createdAt)}
                  </time>
                </header>
                
                <p className="text-granite-700 dark:text-pearl-300 mb-4 leading-relaxed whitespace-pre-wrap memorial-content">
                  {entry.message}
                </p>
                
                <GuestbookReactions 
                  entry={entry} 
                  onReactionAdd={handleReactionAdd} 
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-pearl-100 dark:bg-granite-800 rounded-lg border border-pearl-200 dark:border-granite-700">
            <div className="mx-auto w-16 h-16 bg-pearl-200 dark:bg-granite-700 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">🕊️</div>
            </div>
            <p className="text-granite-600 dark:text-pearl-400 mb-2">
              Inga meddelanden ännu
            </p>
            <p className="text-sm text-granite-500 dark:text-pearl-500">
              Var den första att dela ett minne
            </p>
          </div>
        )}
        
        {/* Entry count and sort info */}
        {guestbookEntries.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-granite-500 dark:text-pearl-400">
              {guestbookEntries.length} {guestbookEntries.length === 1 ? 'meddelande' : 'meddelanden'}
              {guestbookEntries.length > 1 && (
                <span className="ml-2">
                  • Sorterat efter {
                    sortBy === 'newest' ? 'nyaste först' :
                    sortBy === 'oldest' ? 'äldsta först' :
                    'flest reaktioner'
                  }
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 
import React, { useState, useEffect, useRef } from 'react';
import { Reaction, GuestbookEntry } from '@/types/memorial';

interface GuestbookReactionsProps {
  entry: GuestbookEntry;
  onReactionAdd: (entryId: string, emoji: string, action: 'add' | 'remove') => Promise<void>;
}

// Expanded, categorized emoji selection for memorial context
const emojiCategories = {
  love: ['❤️', '💙', '💜', '🤍', '💖', '💝'],
  remembrance: ['🕯️', '🌹', '🌺', '🌸', '🌻', '🌷'],
  support: ['🙏', '🤗', '🫂', '✨', '🌟', '💫'],
  emotions: ['😢', '💔', '😇', '🥺', '😌', '🕊️'],
  celebration: ['🎉', '🎈', '🌈', '☀️', '🦋', '🌅']
};

const allEmojis = Object.values(emojiCategories).flat();

// Local storage key for user reactions
const USER_REACTIONS_KEY = 'guestbook_user_reactions';

// Helper to get user's session ID (simple approach)
const getUserSessionId = () => {
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString() + Math.random().toString(36);
    localStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
};

export default function GuestbookReactions({ entry, onReactionAdd }: GuestbookReactionsProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentReaction, setRecentReaction] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof emojiCategories>('love');
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Load user's previous reactions for this entry
  useEffect(() => {
    const sessionId = getUserSessionId();
    const savedReactions = localStorage.getItem(`${USER_REACTIONS_KEY}_${entry._id}_${sessionId}`);
    if (savedReactions) {
      setUserReactions(new Set(JSON.parse(savedReactions)));
    }
  }, [entry._id]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojis(false);
      }
    };

    if (showEmojis) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojis]);

  const saveUserReaction = (emoji: string, action: 'add' | 'remove') => {
    const sessionId = getUserSessionId();
    const newReactions = new Set(userReactions);
    
    if (action === 'add') {
      newReactions.add(emoji);
    } else {
      newReactions.delete(emoji);
    }
    
    setUserReactions(newReactions);
    localStorage.setItem(
      `${USER_REACTIONS_KEY}_${entry._id}_${sessionId}`,
      JSON.stringify(Array.from(newReactions))
    );
  };

  const handleReactionClick = async (emoji: string) => {
    const hasReacted = userReactions.has(emoji);
    const action = hasReacted ? 'remove' : 'add';
    
    setIsLoading(true);
    setRecentReaction(emoji);
    
    try {
      await onReactionAdd(entry._id, emoji, action);
      saveUserReaction(emoji, action);
      setShowEmojis(false);
      
      // Clear recent reaction after animation
      setTimeout(() => setRecentReaction(null), 1000);
    } catch (error) {
      console.error('Failed to update reaction:', error);
      setRecentReaction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopReactions = () => {
    if (!entry.reactions) return [];
    return entry.reactions
      .filter(reaction => reaction.count > 0) // Only show reactions with count > 0
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Show more reactions
  };

  const getTotalReactions = () => {
    if (!entry.reactions) return 0;
    return entry.reactions.reduce((total, reaction) => total + reaction.count, 0);
  };

  const getReactionCount = (emoji: string) => {
    const reaction = entry.reactions?.find(r => r.emoji === emoji);
    return reaction?.count || 0;
  };

  return (
    <div className="mt-3">
      {/* Show existing reactions */}
      {getTopReactions().length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {getTopReactions().map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReactionClick(reaction.emoji)}
              disabled={isLoading}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 disabled:opacity-50 border ${
                userReactions.has(reaction.emoji)
                  ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              } ${
                recentReaction === reaction.emoji ? 'scale-110 shadow-md' : ''
              }`}
              title={`${userReactions.has(reaction.emoji) ? 'Remove' : 'Add'} ${reaction.emoji} reaction`}
            >
              <span className="text-lg">{reaction.emoji}</span>
              <span className="font-medium">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Total reactions count */}
        {getTotalReactions() > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTotalReactions()} reaction{getTotalReactions() !== 1 ? 's' : ''}
          </span>
        )}

        {/* Add reaction button */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            disabled={isLoading}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 disabled:opacity-50 border ${
              showEmojis 
                ? 'bg-blue-100 border-blue-300 text-blue-600 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Add reaction"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">React</span>
          </button>

          {/* Enhanced emoji picker with categories */}
          {showEmojis && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 z-20 w-80">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                Choose a reaction
              </div>
              
              {/* Category tabs */}
              <div className="flex mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {Object.keys(emojiCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as keyof typeof emojiCategories)}
                    className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Emoji grid */}
              <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                {emojiCategories[selectedCategory].map((emoji) => {
                  const count = getReactionCount(emoji);
                  const hasReacted = userReactions.has(emoji);
                  
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(emoji)}
                      disabled={isLoading}
                      className={`relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 text-xl disabled:opacity-50 hover:scale-110 ${
                        recentReaction === emoji ? 'bg-blue-100 dark:bg-blue-900 scale-110' : ''
                      } ${
                        hasReacted ? 'bg-blue-50 dark:bg-blue-900/50 ring-2 ring-blue-300 dark:ring-blue-700' : ''
                      }`}
                      title={`${hasReacted ? 'Remove' : 'Add'} ${emoji} reaction${count > 0 ? ` (${count})` : ''}`}
                    >
                      {emoji}
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                      {hasReacted && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                Click an emoji to toggle your reaction
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="w-3 h-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-xs text-gray-500">Updating reaction...</span>
        </div>
      )}
    </div>
  );
}
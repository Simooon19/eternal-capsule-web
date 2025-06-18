import React, { useState } from 'react';
import { Reaction, GuestbookEntry } from '@/types/memorial';

interface GuestbookReactionsProps {
  entry: GuestbookEntry;
  onReactionAdd: (entryId: string, emoji: string) => Promise<void>;
}

const availableEmojis = ['❤️', '🕯️', '🙏', '💔', '😢', '🌹', '✨', '🤗'];

export default function GuestbookReactions({ entry, onReactionAdd }: GuestbookReactionsProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReactionClick = async (emoji: string) => {
    setIsLoading(true);
    try {
      await onReactionAdd(entry._id, emoji);
      setShowEmojis(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopReactions = () => {
    if (!entry.reactions) return [];
    return entry.reactions
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const getTotalReactions = () => {
    if (!entry.reactions) return 0;
    return entry.reactions.reduce((total, reaction) => total + reaction.count, 0);
  };

  return (
    <div className="flex items-center space-x-2 mt-3">
      {/* Show existing reactions */}
      {getTopReactions().length > 0 && (
        <div className="flex items-center space-x-1">
          {getTopReactions().map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReactionClick(reaction.emoji)}
              disabled={isLoading}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <span>{reaction.emoji}</span>
              <span className="text-gray-600 dark:text-gray-300">{reaction.count}</span>
            </button>
          ))}
          {getTotalReactions() > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {getTotalReactions()} reaction{getTotalReactions() !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          title="Add reaction"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Emoji picker */}
        {showEmojis && (
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 z-10">
            <div className="grid grid-cols-4 gap-1">
              {availableEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg disabled:opacity-50"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      )}
    </div>
  );
}
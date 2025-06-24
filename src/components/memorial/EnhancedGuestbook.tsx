'use client';

import { useState } from 'react';

interface ReactionType {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface GuestbookEntry {
  id: string;
  author: string;
  message: string;
  date: string;
  reactions?: { [key: string]: number };
}

interface EnhancedGuestbookProps {
  memorialId: string;
  entries: GuestbookEntry[];
  onEntryAdded: () => void;
}

const reactions: ReactionType[] = [
  { id: 'heart', label: 'Kärlek', icon: '💝', color: 'text-red-500' },
  { id: 'candle', label: 'Ljus', icon: '🕯️', color: 'text-amber-500' },
  { id: 'flower', label: 'Blomma', icon: '🌸', color: 'text-pink-500' },
  { id: 'peace', label: 'Fred', icon: '🕊️', color: 'text-serenity-500' },
  { id: 'prayer', label: 'Bön', icon: '🙏', color: 'text-lavender-500' },
];

export default function EnhancedGuestbook({ memorialId, entries, onEntryAdded }: EnhancedGuestbookProps) {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!author.trim() || !message.trim()) {
        throw new Error('Vänligen fyll i alla fält');
      }

      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId,
          author: author.trim(),
          message: message.trim(),
          reaction: selectedReaction,
        }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skicka meddelandet');
      }

      setAuthor('');
      setMessage('');
      setSelectedReaction('');
      setSuccess(true);
      onEntryAdded();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Entry Form */}
      <div className="bg-pearl-50 dark:bg-granite-800 rounded-lg p-6 border border-pearl-200 dark:border-granite-700">
        <h3 className="text-xl font-semibold text-granite-900 dark:text-pearl-100 mb-4">
          Lämna ett meddelande
        </h3>
        <p className="text-sm text-granite-600 dark:text-pearl-400 mb-6">
          Dela dina tankar och minnen för att hedra denna persons minne.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-granite-700 dark:text-pearl-300 mb-2">
              Ditt namn
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 border border-pearl-300 dark:border-granite-600 rounded-md focus:ring-2 focus:ring-serenity-500 focus:border-serenity-500 dark:bg-granite-700 dark:text-pearl-100 transition-colors duration-200"
              placeholder="Skriv ditt namn..."
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-granite-700 dark:text-pearl-300 mb-2">
              Ditt meddelande
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-pearl-300 dark:border-granite-600 rounded-md focus:ring-2 focus:ring-serenity-500 focus:border-serenity-500 dark:bg-granite-700 dark:text-pearl-100 transition-colors duration-200 guestbook-entry"
              placeholder="Dela dina tankar och minnen..."
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-granite-500 dark:text-pearl-500 mt-1">
              {message.length}/1000 tecken
            </p>
          </div>

          {/* Emotional Reaction Selection */}
          <div>
            <label className="block text-sm font-medium text-granite-700 dark:text-pearl-300 mb-3">
              Välj en symbol (valfritt)
            </label>
            <div className="flex flex-wrap gap-3">
              {reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  onClick={() => setSelectedReaction(
                    selectedReaction === reaction.id ? '' : reaction.id
                  )}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                    selectedReaction === reaction.id
                      ? 'bg-serenity-100 dark:bg-serenity-900 border-serenity-300 dark:border-serenity-600 text-serenity-700 dark:text-serenity-300'
                      : 'bg-pearl-100 dark:bg-granite-700 border-pearl-300 dark:border-granite-600 text-granite-600 dark:text-pearl-400 hover:bg-pearl-200 dark:hover:bg-granite-600'
                  }`}
                  disabled={isSubmitting}
                >
                  <span className="text-lg">{reaction.icon}</span>
                  <span className="text-sm font-medium">{reaction.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-serenity-50 border border-serenity-200 text-serenity-700 px-4 py-3 rounded-md">
              Tack för ditt meddelande. Det kommer att delas med kärlek.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !author.trim() || !message.trim()}
            className="w-full bg-serenity-600 hover:bg-serenity-700 disabled:bg-granite-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-serenity-500 focus:ring-offset-2"
          >
            {isSubmitting ? 'Skickar...' : 'Skicka meddelande'}
          </button>
        </form>
      </div>

      {/* Existing Entries */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-granite-900 dark:text-pearl-100">
          Meddelanden ({entries.length})
        </h3>
        
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🕊️</div>
            <p className="text-granite-600 dark:text-pearl-400">
              Inga meddelanden än. Var den första att dela ett minne.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-pearl-50 dark:bg-granite-800 rounded-lg p-6 border border-pearl-200 dark:border-granite-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-granite-900 dark:text-pearl-100">
                    {entry.author}
                  </h4>
                  <time className="text-sm text-granite-500 dark:text-pearl-500">
                    {new Date(entry.date).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                
                <p className="text-granite-700 dark:text-pearl-300 guestbook-entry leading-relaxed mb-4">
                  {entry.message}
                </p>

                {/* Display reactions if any */}
                {entry.reactions && Object.keys(entry.reactions).length > 0 && (
                  <div className="flex items-center space-x-4 pt-3 border-t border-pearl-200 dark:border-granite-700">
                    {Object.entries(entry.reactions).map(([reactionId, count]) => {
                      const reaction = reactions.find(r => r.id === reactionId);
                      return reaction ? (
                        <div key={reactionId} className="flex items-center space-x-1">
                          <span className="text-sm">{reaction.icon}</span>
                          <span className="text-sm text-granite-600 dark:text-pearl-400">
                            {count}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
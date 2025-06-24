'use client';

import { useState } from 'react';

interface AddGuestbookEntryProps {
  memorialId: string;
  onEntryAdded: () => void;
}

export default function AddGuestbookEntry({ memorialId, onEntryAdded }: AddGuestbookEntryProps) {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate input
      if (!author.trim() || !message.trim()) {
        throw new Error('Vänligen fyll i alla fält');
      }

      if (author.trim().length > 100) {
        throw new Error('Författarnamnet får vara högst 100 tecken');
      }

      if (message.trim().length > 500) {
        throw new Error('Meddelandet får vara högst 500 tecken');
      }

      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorialId,
          author: author.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Misslyckades att skicka ditt meddelande');
      }

      setAuthor('');
      setMessage('');
      setSuccess(true);
      setSuccessMessage(result.data?.message || 'Ditt meddelande har skickats framgångsrikt!');
      
      // Call the callback to refresh entries
      onEntryAdded();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Misslyckades att lägga till ditt meddelande. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Lämna ett Meddelande</h3>
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ditt Namn
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            maxLength={100}
            disabled={isSubmitting}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-copper-500 focus:border-copper-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Ange ditt namn"
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {author.length}/100 tecken
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ditt Meddelande
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={500}
            rows={4}
            disabled={isSubmitting}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-copper-500 focus:border-copper-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Dela dina minnen och tankar..."
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {message.length}/500 tecken
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !author.trim() || !message.trim()}
          className="w-full px-4 py-2 bg-copper-600 text-white rounded-md hover:bg-copper-700 focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Skickar...
            </div>
          ) : (
            'Dela Ditt Meddelande'
          )}
        </button>
      </form>
    </div>
  );
} 
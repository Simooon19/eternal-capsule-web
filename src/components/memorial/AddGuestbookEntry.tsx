'use client';

import { useState } from 'react';
import { client } from '@/lib/sanity';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate input
      if (!author.trim() || !message.trim()) {
        throw new Error('Please fill in all fields');
      }

      const doc = {
        _type: 'guestbookEntry',
        author: author.trim(),
        message: message.trim(),
        status: 'pending',
        memorial: {
          _type: 'reference',
          _ref: memorialId
        }
      };

      console.log('Creating guestbook entry:', doc);
      const result = await client.create(doc);
      console.log('Guestbook entry created:', result);

      setAuthor('');
      setMessage('');
      setSuccess(true);
      onEntryAdded();
    } catch (err) {
      console.error('Error adding guestbook entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Leave a Message</h3>
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
          Thank you for your message. It will be visible after approval.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-copper-500 focus:border-copper-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-copper-500 focus:border-copper-500"
            placeholder="Share your memories and thoughts..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-copper-600 text-white rounded-md hover:bg-copper-700 focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
} 
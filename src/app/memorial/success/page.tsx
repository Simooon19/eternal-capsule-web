'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Memorial Submitted Successfully
          </h2>
          
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Thank you for creating a memorial. Your submission is now pending review by our team.
            We will notify you once it has been approved.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-copper-600 hover:bg-copper-700"
            >
              Return to Home
            </Link>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>What happens next?</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Our team will review your submission</li>
                <li>We'll check the content and images</li>
                <li>You'll receive an email when approved</li>
                <li>The memorial will then be publicly visible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
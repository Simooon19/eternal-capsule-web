'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-granite-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-granite-900 mb-2">
            Något gick fel
          </h1>
          
          <p className="text-granite-600 mb-6">
            Vi ber om ursäkt för besväret. Ett oväntat fel uppstod när vi behandlade din begäran.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-copper-600 hover:bg-copper-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2"
          >
            Försök igen
          </button>
          
          <a
            href="/"
            className="block w-full bg-white hover:bg-granite-50 text-granite-900 font-medium py-3 px-4 rounded-md border border-granite-300 transition-colors focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2"
          >
            Tillbaka till startsidan
          </a>
          
          <a
            href="/contact"
            className="block text-sm text-granite-500 hover:text-copper-600 transition-colors"
          >
            Kontakta support om problemet kvarstår
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-granite-500 hover:text-granite-700">
              Feldetaljer (endast utveckling)
            </summary>
            <pre className="mt-2 p-4 bg-granite-100 rounded text-xs text-granite-800 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
} 
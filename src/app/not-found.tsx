import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-granite-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-granite-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-granite-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold text-granite-900 mb-4">404</h1>
          
          <h2 className="text-2xl font-semibold text-granite-900 mb-2">
            Sidan Hittades Inte
          </h2>
          
          <p className="text-granite-600 mb-6">
            Minneslunden eller sidan du letar efter finns inte eller kan ha flyttats.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-copper-600 hover:bg-copper-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2"
          >
            Tillbaka till startsidan
          </Link>
          
          <Link
            href="/memorial/explore"
            className="block w-full bg-white hover:bg-granite-50 text-granite-900 font-medium py-3 px-4 rounded-md border border-granite-300 transition-colors focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2"
          >
            Utforska alla minneslundar
          </Link>
          
          <div className="flex justify-center space-x-6 pt-4">
            <Link
              href="/obituaries"
              className="text-sm text-granite-500 hover:text-copper-600 transition-colors"
            >
              Recent obituaries
            </Link>
            <Link
              href="/contact"
              className="text-sm text-granite-500 hover:text-copper-600 transition-colors"
            >
              Contact support
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-granite-200">
          <p className="text-xs text-granite-400">
            Looking for a specific memorial? Try using the search function on our explore page.
          </p>
        </div>
      </div>
    </div>
  );
} 
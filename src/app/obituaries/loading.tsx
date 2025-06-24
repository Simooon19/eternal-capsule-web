export default function Loading() {
  return (
    <div className="min-h-screen bg-granite-50">
      {/* Navigation skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-granite-900 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-6 w-32 bg-granite-700 rounded animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-4 w-20 bg-granite-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-granite-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-granite-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <main className="pt-16">
        {/* Hero section skeleton */}
        <section className="bg-granite-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-10 w-72 bg-granite-200 rounded mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 w-96 bg-granite-200 rounded mx-auto animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Obituaries content skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Count indicator skeleton */}
            <div className="mb-8 text-center">
              <div className="h-4 w-64 bg-granite-200 rounded mx-auto animate-pulse"></div>
            </div>
            
            {/* Obituary cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-granite-200 overflow-hidden">
                  {/* Memorial card skeleton */}
                  <div className="relative overflow-hidden rounded-lg bg-granite-200 aspect-[4/3] animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-6 w-3/4 bg-granite-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-granite-200 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-granite-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Additional obituary info skeleton */}
                  <div className="p-4 border-t border-granite-100">
                    <div className="space-y-1">
                      <div className="h-4 w-48 bg-granite-200 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-granite-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Support resources skeleton */}
            <div className="mt-16 text-center">
              <div className="h-8 w-48 bg-granite-200 rounded mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 w-96 bg-granite-200 rounded mx-auto mb-8 animate-pulse"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="h-12 w-48 bg-granite-200 rounded animate-pulse"></div>
                <div className="h-12 w-40 bg-granite-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Memorial creation CTA skeleton */}
        <section className="py-16 bg-granite-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-8 w-80 bg-granite-700 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-granite-700 rounded mx-auto mb-8 animate-pulse"></div>
            <div className="h-12 w-40 bg-granite-700 rounded mx-auto animate-pulse"></div>
          </div>
        </section>
      </main>
    </div>
  );
} 
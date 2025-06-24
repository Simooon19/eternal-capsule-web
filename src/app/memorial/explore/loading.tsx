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
              <div className="h-10 w-80 bg-granite-200 rounded mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 w-96 bg-granite-200 rounded mx-auto animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Search section skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-10 w-full bg-granite-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full md:w-48">
                  <div className="h-10 w-full bg-granite-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Memorial cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-granite-200 aspect-[4/3] mb-4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-granite-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-granite-200 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-granite-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics section skeleton */}
        <section className="py-16 bg-granite-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="h-8 w-64 bg-granite-200 rounded mx-auto mb-8 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-12 w-16 bg-granite-200 rounded mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 w-24 bg-granite-200 rounded mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 
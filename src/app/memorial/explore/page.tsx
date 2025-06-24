import { Navigation } from '@/components/Navigation';
import MemorialSearch from '@/components/memorial/MemorialSearch';
import { client } from '@/lib/sanity';
import type { Memorial } from '@/types/memorial';

// Fetch all memorials for exploration
async function getAllMemorials(): Promise<Memorial[]> {
  try {
    const query = `*[_type == "memorial"] | order(_createdAt desc) {
      _id,
      name,
      born,
      died,
      description,
      "imageUrl": image.asset->url,
      tags,
      slug,
      personalInfo {
        dateOfBirth,
        dateOfDeath,
        restingPlace {
          coordinates
        }
      },
      _createdAt
    }`;
    
    const memorials = await client.fetch(query);
    
    // Transform data to handle both old and new schema
    return memorials.map((memorial: any) => ({
      ...memorial,
      born: memorial.born || memorial.personalInfo?.dateOfBirth,
      died: memorial.died || memorial.personalInfo?.dateOfDeath,
      location: memorial.personalInfo?.restingPlace?.coordinates
    }));
  } catch (error) {
    console.error('Error fetching memorials:', error);
    return [];
  }
}

export const metadata = {
  title: 'Utforska Minneslundar - Minneslund',
  description: 'Upptäck och utforska digitala minneslundar i vår gemenskap. Sök, filtrera och hedra de liv som firats på vår plattform.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function ExplorePage() {
  const memorials = await getAllMemorials();

  return (
    <div>
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-granite-50 py-16">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/images/explore-background.jpg" 
              alt="Memorial garden background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
          </div>
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Utforska Minneslundar
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Upptäck och hedra de liv som firats i vår gemenskap. Varje minneslund berättar en unik historia om kärlek, förlust och hågkomst.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {memorials.length > 0 ? (
              <MemorialSearch memorials={memorials} />
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-granite-900 mb-4">
                  Inga Minneslundar Ännu
                </h2>
                <p className="text-granite-600 mb-8 max-w-md mx-auto">
                  Bli den första att skapa en vacker minneslund och hedra någon speciell i ditt liv.
                </p>
                <a
                  href="/memorial/create"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-copper-600 hover:bg-copper-700"
                >
                  Skapa Första Minneslunden
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Statistics Section */}
        {memorials.length > 0 && (
          <section className="py-16 bg-granite-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-granite-900 mb-8">
                  Vår Gemenskaps Påverkan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-copper-600 mb-2">
                      {memorials.length}
                    </div>
                    <div className="text-granite-700">
                      {memorials.length === 1 ? 'Minneslund' : 'Minneslundar'} Skapade
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-copper-600 mb-2">
                      {memorials.filter(m => m.tags && m.tags.length > 0).length}
                    </div>
                    <div className="text-granite-700">
                      Berättelser Delade
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-copper-600 mb-2">
                      ∞
                    </div>
                    <div className="text-granite-700">
                      Minnen Bevarade
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
} 
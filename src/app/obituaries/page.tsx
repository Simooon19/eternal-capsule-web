import { Navigation } from '@/components/Navigation';
import MemorialCard from '@/components/MemorialCard';
import { client } from '@/lib/sanity';
import type { Memorial } from '@/types/memorial';
import Link from 'next/link';

// Fetch recent obituaries (memorials from the last year)
async function getRecentObituaries(): Promise<Memorial[]> {
  try {
    // Get memorials from the last 30 days for "today's" feel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    const query = `*[_type == "memorial" && (
      died >= "${cutoffDate}" || 
      personalInfo.dateOfDeath >= "${cutoffDate}" ||
      _createdAt >= "${cutoffDate}"
    )] | order(coalesce(died, personalInfo.dateOfDeath, _createdAt) desc) {
      _id,
      title,
      name,
      subtitle,
      born,
      died,
      description,
      bornAt,
      diedAt,
      "imageUrl": image.asset->url,
      tags,
      slug,
      personalInfo {
        dateOfBirth,
        dateOfDeath,
        birthLocation,
        deathLocation,
        restingPlace {
          coordinates,
          cemetery
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
    console.error('Error fetching obituaries:', error);
    return [];
  }
}

export const metadata = {
  title: 'Dödsannonser - Minneslund',
  description: 'Senaste dödsannonserna från vår gemenskap. Minns och hedra dem som gått bort.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function ObituariesPage() {
  const obituaries = await getRecentObituaries();
  const today = new Date();

  // Helper function to format age
  const calculateAge = (born: string, died: string) => {
    if (!born || !died) return null;
    const birthDate = new Date(born);
    const deathDate = new Date(died);
    return Math.floor((deathDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // Helper function to format newspaper date
  const formatNewspaperDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group obituaries by date for newspaper feel
  const todayObituaries = obituaries.filter(obit => {
    const deathDate = new Date(obit.died || obit.personalInfo?.dateOfDeath || obit._createdAt);
    const diffTime = today.getTime() - deathDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Last 7 days
  });

  const olderObituaries = obituaries.filter(obit => {
    const deathDate = new Date(obit.died || obit.personalInfo?.dateOfDeath || obit._createdAt);
    const diffTime = today.getTime() - deathDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  });

  return (
    <div>
      <Navigation />
      <main className="pt-16 bg-white">
        {/* Newspaper Header */}
        <section className="border-b-2 border-granite-900 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center border-b border-granite-300 pb-6 mb-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-granite-900 mb-2">
                DÖDSANNONSER
              </h1>
              <div className="text-sm text-granite-600 font-medium tracking-wide">
                {formatNewspaperDate(today)}
              </div>
            </div>
            
            {/* Newspaper-style subtitle */}
            <div className="text-center">
              <p className="text-lg font-serif italic text-granite-700">
                "Till minne av dem som berört våra liv"
              </p>
            </div>
          </div>
        </section>

        {/* Today's Obituaries Section */}
        {todayObituaries.length > 0 && (
          <section className="py-12 bg-granite-25">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-serif font-bold text-granite-900 mb-8 text-center border-b border-granite-300 pb-2">
                Senaste Dödsannonserna
              </h2>
              
              <div className="space-y-8">
                                 {todayObituaries.map((obituary) => {
                   const birthDate = obituary.born || obituary.personalInfo?.dateOfBirth;
                   const deathDate = obituary.died || obituary.personalInfo?.dateOfDeath;
                   const age = (birthDate && deathDate) ? calculateAge(birthDate, deathDate) : null;
                   const location = obituary.diedAt?.location || obituary.personalInfo?.deathLocation || '';
                   
                   return (
                     <article key={obituary._id} className="bg-white p-6 rounded-lg shadow-sm border border-granite-200">
                       <div className="flex flex-col md:flex-row gap-6">
                         {/* Photo */}
                         <div className="flex-shrink-0">
                           <div className="w-24 h-32 md:w-32 md:h-40 bg-granite-100 rounded border overflow-hidden">
                             {obituary.coverImage || obituary.gallery?.[0] ? (
                               <img
                                 src="/images/placeholder-memorial.svg"
                                 alt={`${obituary.title || obituary.name}`}
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <img
                                 src="/images/placeholder-memorial.svg"
                                 alt={`Memorial placeholder for ${obituary.title || obituary.name}`}
                                 className="w-full h-full object-cover opacity-60"
                               />
                             )}
                           </div>
                         </div>
                        
                        {/* Obituary Content */}
                        <div className="flex-1">
                          <header className="mb-4">
                            <h3 className="text-xl md:text-2xl font-serif font-bold text-granite-900 mb-1">
                              {obituary.title || obituary.name}
                            </h3>
                            
                            <div className="text-granite-700 font-medium">
                              {age && <span>Ålder {age}</span>}
                              {location && (
                                <>
                                  {age && <span> • </span>}
                                  <span>från {location}</span>
                                </>
                              )}
                            </div>
                            
                            {deathDate && (
                              <div className="text-sm text-granite-600 mt-1">
                                Avled {new Date(deathDate).toLocaleDateString('sv-SE', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                          </header>
                          
                          {/* Obituary Text */}
                          {obituary.subtitle && (
                            <p className="text-granite-700 leading-relaxed mb-4 font-serif">
                              {obituary.subtitle}
                            </p>
                          )}
                          
                          {/* View Memorial Link */}
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/memorial/${obituary.slug.current}`}
                              className="text-copper-600 hover:text-copper-700 font-medium text-sm border-b border-copper-300 hover:border-copper-500 transition-colors"
                            >
                              Se Hela Minneslunden →
                            </Link>
                            
                            {/* Family Services Info */}
                            <div className="text-xs text-granite-500">
                              Minneslunds-ID: {obituary._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Previous Obituaries Section */}
        {olderObituaries.length > 0 && (
          <section className="py-12">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-serif font-bold text-granite-900 mb-8 text-center border-b border-granite-300 pb-2">
                Tidigare Dödsannonser
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {olderObituaries.map((obituary) => (
                  <div key={obituary._id} className="bg-white border border-granite-200 rounded-lg overflow-hidden shadow-sm">
                    <MemorialCard memorial={obituary} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* No Obituaries State */}
        {obituaries.length === 0 && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="text-granite-400 mb-6">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-granite-900 mb-4">
                Inga Senaste Dödsannonser
              </h2>
              <p className="text-granite-600 mb-8 max-w-md mx-auto font-serif">
                Det finns för närvarande inga nya dödsannonser att visa. Du kan utforska alla minneslundar eller skapa en ny minneslund för din nära och kära.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/memorial/explore"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-copper-600 hover:bg-copper-700"
                >
                  Se Alla Minneslundar
                </Link>
                <Link
                  href="/memorial/create"
                  className="inline-flex items-center px-6 py-3 border border-copper-600 text-base font-medium rounded-md text-copper-600 hover:bg-copper-50"
                >
                  Skicka In Dödsannons
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Newspaper Footer */}
        <section className="py-8 bg-granite-50 border-t border-granite-300">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-granite-600">
                <Link href="/memorial/explore" className="hover:text-copper-600">
                  Bläddra Bland Alla Minneslundar
                </Link>
                <Link href="/memorial/create" className="hover:text-copper-600">
                  Skicka In Dödsannons
                </Link>
                <Link href="/contact" className="hover:text-copper-600">
                  Kontakta Oss
                </Link>
              </div>
              
              <div className="mt-4 pt-4 border-t border-granite-200 text-xs text-granite-500 font-serif italic">
                "Vi firar liv, bevarar minnen och förenar gemenskaper"
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 
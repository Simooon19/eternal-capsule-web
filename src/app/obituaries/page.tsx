import { Navigation } from '@/components/Navigation';
import MemorialCard from '@/components/MemorialCard';
import { client } from '@/lib/sanity';
import type { Memorial } from '@/types/memorial';
import Link from 'next/link';
import LocationBasedObituaries from '@/components/memorial/LocationBasedObituaries';

// Fetch recent obituaries (memorials from the last year)
async function getRecentObituaries(): Promise<Memorial[]> {
  try {
    // Get memorials from the last 30 days for "today's" feel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    const query = `*[
      _type == "memorial" && 
      status == "published" && 
      !(_id in path("drafts.**")) &&
      defined(title) && 
      defined(personalInfo.dateOfBirth) && 
      defined(personalInfo.dateOfDeath) &&
      !(title match "test*") &&
      !(title match "*test*") &&
      !(title match "fjärt*") &&
      !(title match "*fjärt*") &&
      defined(heroImage) &&
      (
        personalInfo.dateOfDeath >= "${cutoffDate}" ||
        _createdAt >= "${cutoffDate}"
      )
    ] | order(slug.current asc) | order(coalesce(personalInfo.dateOfDeath, _createdAt) desc) {
      _id,
      title,
      subtitle,
      "heroImage": heroImage{
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt,
        caption
      },
      "gallery": gallery[]{
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt,
        caption
      },
      tags,
      slug,
      personalInfo {
        dateOfBirth,
        dateOfDeath,
        birthLocation {
          location,
          coordinates,
          geocodingInfo
        },
        deathLocation {
          location,
          coordinates,
          geocodingInfo
        },
        restingPlace {
          cemetery,
          location,
          section,
          coordinates
        }
      },
      _createdAt
    }`;
    
    const memorials = await client.fetch(query);
    
    // Transform data to match MemorialCard expectations with improved robustness
    return memorials.map((memorial: any) => ({
      ...memorial,
      // Map name fields for MemorialCard compatibility
      name: memorial.title || '', // MemorialCard checks title || name
      
      // Map image fields for MemorialCard compatibility with fallback handling
      coverImage: memorial.heroImage && memorial.heroImage.asset?.url ? {
        url: memorial.heroImage.asset.url,
        alt: memorial.heroImage.alt || `Memorial photo of ${memorial.title}`,
        caption: memorial.heroImage.caption,
        width: memorial.heroImage.asset?.metadata?.dimensions?.width || 800,
        height: memorial.heroImage.asset?.metadata?.dimensions?.height || 600
      } : null,
      
      // Map date fields for MemorialCard compatibility
      born: memorial.personalInfo?.dateOfBirth,
      died: memorial.personalInfo?.dateOfDeath,
      
      // Map location fields for MemorialCard compatibility with improved handling
      bornAt: memorial.personalInfo?.birthLocation?.location ? {
        location: memorial.personalInfo.birthLocation.location,
        coordinates: memorial.personalInfo.birthLocation.coordinates
      } : null,
      diedAt: memorial.personalInfo?.deathLocation?.location ? {
        location: memorial.personalInfo.deathLocation.location,
        coordinates: memorial.personalInfo.deathLocation.coordinates
      } : null,
      
      // Keep original personalInfo for other components that might need it
      personalInfo: memorial.personalInfo
    })).filter((memorial: any) => 
      // Additional safety filter to ensure valid memorials
      memorial.title && 
      memorial.personalInfo?.dateOfBirth && 
      memorial.personalInfo?.dateOfDeath &&
      memorial._id
    );
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

  // Helper function to format newspaper date
  const formatNewspaperDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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

        {/* Recent Obituaries - Location-based sorting with 4x6 Grid Layout */}
        {obituaries.length > 0 && (
          <LocationBasedObituaries obituaries={obituaries} />
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
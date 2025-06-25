import HeroSection from '@/components/HeroSection';
import { Navigation } from '@/components/Navigation';
import MemorialCard from '@/components/MemorialCard';
import Link from 'next/link';
import { client } from '@/lib/sanity';
import type { Memorial } from '@/types/memorial';

// Fetch recent memorials
async function getRecentMemorials(): Promise<Memorial[]> {
  try {
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
      defined(heroImage)
    ] | order(slug.current asc) | order(_createdAt desc) [0...3] {
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
    console.error('Error fetching memorials:', error);
    return [];
  }
}

export default async function HomePage() {
  const memorials = await getRecentMemorials();

  return (
    <>
      <Navigation />
      <main>
        <HeroSection 
          title="Minneslund"
          subtitle="Skapa digitala minneslundar som hedrar liv och bevarar minnen för kommande generationer."
          image="/images/hero-background.jpg"
          primaryCta={{
            text: "Skapa Minneslund",
            href: "/memorial/create"
          }}
          secondaryCta={{
            text: "Utforska Minneslundar",
            href: "/memorial/explore"
          }}
        />
        
        {/* Recent Memorials Section */}
        <section className="py-16 bg-granite-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-granite-900 mb-4">
                Senaste Minneslundarna
              </h2>
              <p className="text-lg text-granite-700">
                Upptäck och hedra de liv som firats i vår gemenskap
              </p>
            </div>
            
            {memorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {memorials.map((memorial) => (
                  <MemorialCard key={memorial._id} memorial={memorial} />
                ))}
              </div>
            ) : (
              <div className="text-center text-granite-600">
                <p>Inga minneslundar ännu. Bli den första att skapa en.</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                href="/memorial/explore"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-copper-600 hover:bg-copper-700"
              >
                Utforska Alla Minneslundar
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-granite-900 mb-4">
                Varför Välja Minneslund?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* NFC Feature */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-copper-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-granite-900 mb-2">
                  NFC-teknologi
                </h3>
                <p className="text-granite-600">
                  Koppla fysiska minnesplatser till digitala minnen med NFC-taggar för omedelbar mobilåtkomst.
                </p>
              </div>

              {/* Photo Gallery Feature */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-copper-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-granite-900 mb-2">
                  Fotogallerier
                </h3>
                <p className="text-granite-600">
                  Bevara foton, berättelser och minnen på en säker plattform som varar i generationer.
                </p>
              </div>

              {/* Guestbook Feature */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-copper-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-granite-900 mb-2">
                  Interaktiv Gästbok
                </h3>
                <p className="text-granite-600">
                  Låt besökare lämna meddelanden, dela minnen och bidra till minneslunden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-granite-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Skapa en Bestående Minneslund Idag
            </h2>
            <p className="text-xl text-granite-300 mb-8">
              Hedra dina nära och kära med en vacker digital minneslund som bevarar deras minne för alltid.
            </p>
            <div className="space-x-4">
              <Link
                href="/memorial/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-granite-900 bg-copper-500 hover:bg-copper-600"
              >
                Skapa Minneslund
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 border border-copper-500 text-base font-medium rounded-md text-copper-500 hover:bg-copper-50"
              >
                Se Priser
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 
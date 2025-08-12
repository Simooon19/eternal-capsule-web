import { Navigation } from '@/components/Navigation';
import MemorialContent from '@/components/memorial/MemorialContent';
import { client } from '@/lib/sanity';
import { generateMemorialTitle, generateMemorialDescription } from '@/lib/seo';
import type { Memorial } from '@/types/memorial';
import { notFound } from 'next/navigation';

interface MemorialPageProps {
  params: {
    slug: string;
  };
}

async function getMemorial(slug: string): Promise<Memorial | null> {
  try {
    const query = `*[
      _type == "memorial" && 
      slug.current == $slug &&
      !(_id in path("drafts.**")) &&
      defined(title) &&
      !(title match "test*") &&
      !(title match "*test*") &&
      !(title match "fjärt*") &&
      !(title match "*fjärt*")
    ][0] {
      _id,
      title,
      preferredName,
      subtitle,
      slug,
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
      gallery[] {
        _key,
        asset-> {
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
      biography,
      personalInfo {
        dateOfBirth,
        dateOfDeath,
        age,
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
      timeline[] {
        _key,
        date,
        title,
        description,
        image {
          asset-> {
            _id,
            url
          },
          alt
        }
      },
      videos[] {
        _key,
        asset-> {
          _id,
          url,
          playbackId,
          filename
        },
        title,
        description
      },
      audioMemories[] {
        _key,
        asset-> {
          _id,
          url,
          filename
        },
        title,
        description
      },
      guestbook[] | order(createdAt desc) {
        _id,
        author,
        message,
        createdAt,
        status,
        reactions[] {
          emoji,
          count
        }
      },
      tags,
      privacy,
      status,
      nfcTagUid,
      viewCount,
      scanCount,
      createdAt,
      updatedAt,
      _createdAt,
      _updatedAt
    }`;
    
    const memorial = await client.fetch(query, { slug });
    
    if (!memorial) return null;
    
    // Transform data to match component expectations with improved robustness
    const transformedMemorial = {
      ...memorial,
      // Map name fields for backward compatibility
      name: memorial.title || '',
      
      // Map image fields with proper fallback handling
      coverImage: memorial.heroImage && memorial.heroImage.asset?.url ? {
        url: memorial.heroImage.asset.url,
        alt: memorial.heroImage.alt || `Memorial photo of ${memorial.title}`,
        caption: memorial.heroImage.caption,
        width: memorial.heroImage.asset?.metadata?.dimensions?.width || 800,
        height: memorial.heroImage.asset?.metadata?.dimensions?.height || 600
      } : null,
      
      // Map gallery images with improved handling
      gallery: memorial.gallery?.map((item: any, index: number) => ({
        _key: item._key || `gallery-${index}`,
        url: item.asset?.url || '',
        alt: item.alt || `Gallery photo ${index + 1}`,
        caption: item.caption,
        width: item.asset?.metadata?.dimensions?.width || 800,
        height: item.asset?.metadata?.dimensions?.height || 600
      })).filter((item: any) => item.url) || [],
      
      // Map date fields for component compatibility
      born: memorial.personalInfo?.dateOfBirth,
      died: memorial.personalInfo?.dateOfDeath,
      
      // Map location fields for component compatibility with improved handling
      bornAt: memorial.personalInfo?.birthLocation?.location ? {
        location: memorial.personalInfo.birthLocation.location,
        coordinates: memorial.personalInfo.birthLocation.coordinates
      } : null,
      diedAt: memorial.personalInfo?.deathLocation?.location ? {
        location: memorial.personalInfo.deathLocation.location,
        coordinates: memorial.personalInfo.deathLocation.coordinates
      } : null,
      
      // Map story content - biography becomes storyBlocks for component compatibility
      storyBlocks: memorial.biography || [],
      
      // Keep original personalInfo for new components that use it properly
      personalInfo: memorial.personalInfo
    };
    
    return transformedMemorial;
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return null;
  }
}

export async function generateMetadata({ params }: MemorialPageProps) {
  const memorial = await getMemorial(params.slug);
  
  if (!memorial) {
    return {
      title: 'Memorial Not Found - Eternal Capsule',
      description: 'The requested memorial could not be found.',
    };
  }

  return {
    title: generateMemorialTitle(memorial),
    description: generateMemorialDescription(memorial),
    openGraph: {
      title: generateMemorialTitle(memorial),
      description: generateMemorialDescription(memorial),
      url: `/memorial/${memorial.slug.current}`,
      type: 'profile',
      images: memorial.coverImage ? [memorial.coverImage.url] : [],
    },
  };
}

export default async function MemorialPage({ params }: MemorialPageProps) {
  const memorial = await getMemorial(params.slug);

  if (!memorial) {
    notFound();
  }

  // Check privacy settings
  if (memorial.privacy === 'password-protected') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Denna minnessida är lösenordsskyddad</h2>
        <p className="text-granite-600">Vänligen kontakta familjen eller administratören för åtkomst.</p>
      </div>
    )
  }

  return (
    <div>
      <Navigation />
      <main className="pt-16">
        <MemorialContent memorial={memorial} />
      </main>
    </div>
  );
} 
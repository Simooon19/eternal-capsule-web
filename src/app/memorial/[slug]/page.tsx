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
    const query = `*[_type == "memorial" && slug.current == $slug][0] {
      _id,
      title,
      name,
      subtitle,
      description,
      slug,
      born,
      died,
      bornAt,
      diedAt,
      personalInfo,
      coverImage,
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
      storyBlocks,
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
    return memorial;
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
    // TODO: Implement password protection component
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
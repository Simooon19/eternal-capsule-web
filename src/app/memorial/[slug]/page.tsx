import { client } from '@/lib/sanity';
import { urlForImage } from '@/lib/sanity';
import { Memorial } from '@/types/memorial';
import { MemorialContent } from '@/components/memorial/MemorialContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const memorial = await client.fetch(`*[_type == "memorial" && slug.current == $slug][0] {
    name,
    born,
    died,
    description,
    gallery,
    storyBlocks,
    guestbook,
    status,
    createdAt,
    updatedAt
  }`, { slug: params.slug });

  if (!memorial) {
    return {
      title: 'Memorial Not Found',
      description: 'The requested memorial could not be found.',
    };
  }

  return {
    title: `${memorial.name}'s Memorial`,
    description: `A memorial for ${memorial.name} (${new Date(memorial.born).getFullYear()} - ${new Date(memorial.died).getFullYear()})`,
    openGraph: {
      title: `${memorial.name}'s Memorial`,
      description: `A memorial for ${memorial.name} (${new Date(memorial.born).getFullYear()} - ${new Date(memorial.died).getFullYear()})`,
      images: memorial.gallery?.[0] ? [urlForImage(memorial.gallery[0]).width(1200).height(600).url()] : [],
    },
  };
}

async function getMemorial(slug: string): Promise<Memorial | null> {
  const query = `*[_type == "memorial" && slug.current == $slug][0]{
    _id,
    title,
    subtitle,
    slug,
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
      alt
    },
    story,
    bornAt,
    diedAt,
    "storyBlocks": story[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          "slug": @.reference->slug.current
        }
      }
    }
  }`

  const memorial = await client.fetch(query, { slug })

  if (!memorial) {
    return null
  }

  // Transform and validate the data
  const transformedMemorial: Memorial = {
    ...memorial,
    gallery: memorial.gallery?.map((image: any) => ({
      _key: image._key,
      url: image.asset?.url || '',
      alt: image.alt || '',
      width: image.asset?.metadata?.dimensions?.width || 0,
      height: image.asset?.metadata?.dimensions?.height || 0
    })).filter((image: any) => image.url && image.width > 0 && image.height > 0) || [],
    storyBlocks: memorial.storyBlocks || [],
    bornAt: memorial.bornAt ? {
      location: memorial.bornAt.location || ''
    } : undefined,
    diedAt: memorial.diedAt ? {
      location: memorial.diedAt.location || ''
    } : undefined
  }

  return transformedMemorial
}

export default async function MemorialPage({ params }: PageProps) {
  const memorial = await getMemorial(params.slug)

  if (!memorial) {
    notFound()
  }

  return <MemorialContent memorial={memorial} />
}
import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { memorials } from './mock-memorials';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = '2024-03-19';

if (!projectId || !dataset) {
  throw new Error('Missing Sanity environment variables');
}

// Mock client for development with sample data
const createMockClient = () => ({
  fetch: async (query: string, params?: any) => {
    console.log('Mock Sanity fetch:', { query, params });
    
    // Simulate fetching memorials
    if (query.includes('*[_type == "memorial"')) {
      if (params?.slug) {
        const memorial = memorials.find(m => m.slug.current === params.slug);
        return memorial || null;
      }
      
      // Filter by status if specified
      if (query.includes('status == "published"') || query.includes('status == "approved"')) {
        return memorials.filter(m => m.status === 'approved' || m.status === 'published');
      }
      
      return memorials;
    }
    
    // Default empty response
    return [];
  }
});

// Create client - use mock in development with sample project
export const client = projectId === 'sample-project' 
  ? createMockClient()
  : createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_WRITE_TOKEN,
    });

const builder = imageUrlBuilder(
  projectId === 'sample-project' 
    ? { projectId: 'sample', dataset: 'production' } as any // Mock builder
    : createClient({ projectId, dataset, apiVersion, useCdn: true })
);

export function urlForImage(source: SanityImageSource) {
  if (projectId === 'sample-project') {
    // Return the URL directly for mock data
    if (typeof source === 'object' && source && 'url' in source) {
      return { url: () => source.url };
    }
    return { url: () => '/images/placeholder.jpg' };
  }
  return builder.image(source);
}

// GROQ query helpers
export const memorialBySlugQuery = `*[_type == "memorial" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  born,
  died,
  storyBlocks,
  gallery,
  ntagUid,
  status
}`;

export const allMemorialsQuery = `*[_type == "memorial"] | order(_createdAt desc) {
  _id,
  name,
  slug,
  born,
  died,
  gallery[0],
  status
}`; 
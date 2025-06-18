import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = '2024-03-19';

if (!projectId || !dataset) {
  throw new Error('Missing Sanity environment variables');
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
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
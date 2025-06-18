export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-19';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const useCdn = process.env.NODE_ENV === 'production';

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}

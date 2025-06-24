import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { mockMemorials } from './mock-memorials';
import config from '@/lib/config';

const projectId = config.sanity.projectId;
const dataset = config.sanity.dataset;
const apiVersion = config.sanity.apiVersion;
const token = config.sanity.token;

if (!projectId || !dataset) {
  throw new Error('Missing Sanity environment variables');
}

// Mock client for development with sample data
const createMockClient = (): any => ({
  fetch: async (query: string, params?: any) => {
    // Mock client query - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Using mock Sanity client for query:', query.substring(0, 50) + '...');
    }
    
    // Simulate fetching memorials
    if (query.includes('*[_type == "memorial"')) {
      if (params?.slug) {
        const memorial = mockMemorials.find(m => m.slug.current === params.slug);
        return memorial || null;
      }
      
      // Filter by status if specified
      if (query.includes('status == "published"') || query.includes('status == "approved"')) {
        return mockMemorials.filter(m => m.status === 'approved' || m.status === 'published');
      }
      
      return mockMemorials;
    }
    
    // Handle guestbook queries
    if (query.includes('*[_type == "guestbookEntry"')) {
      // Return mock guestbook entries
      const mockGuestbook = [
        {
          _id: 'mock_entry_1',
          _type: 'guestbookEntry',
          author: 'Sarah Johnson',
          message: 'Such beautiful memories shared here. Thank you for creating this wonderful tribute.',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          reactions: [{ emoji: '❤️', count: 3 }, { emoji: '🙏', count: 1 }]
        },
        {
          _id: 'mock_entry_2',
          _type: 'guestbookEntry',
          author: 'Michael Brown',
          message: 'A life well lived and fondly remembered. Peace and comfort to all who loved them.',
          status: 'approved',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          reactions: [{ emoji: '🙏', count: 2 }]
        }
      ];
      
      if (params?.memorialId) {
        return mockGuestbook;
      }
      
      if (params?.id) {
        return mockGuestbook.find(entry => entry._id === params.id) || null;
      }
      
      return mockGuestbook;
    }
    
    // Default empty response
    return [];
  },
  create: async (doc: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Mock creating document:', doc._type);
    }
    
    // For guestbook entries, create a realistic mock response
    if (doc._type === 'guestbookEntry') {
      const mockEntry = {
        ...doc,
        _id: `mock_entry_${Date.now()}`,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _type: 'guestbookEntry'
      };
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return mockEntry;
    }
    
    // Default mock create operation
    return { 
      ...doc, 
      _id: `mock_${Date.now()}`, 
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString()
    };
  },
  patch: (id: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Mock patching document:', id);
    }
    
    const patchInstance: any = {
      set: (data: any) => {
        Object.assign(patchInstance, { _data: data });
        return patchInstance;
      },
      inc: (data: any) => {
        Object.assign(patchInstance, { _incData: data });
        return patchInstance;
      },
      commit: async () => {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 50));
        
        return { 
          _id: id, 
          _updatedAt: new Date().toISOString(),
          ...patchInstance._data, 
          ...patchInstance._incData 
        };
      }
    };
    return patchInstance;
  }
});

// Enhanced client creation with better authentication handling
const createSanityClient = () => {
  const hasRealProjectId = projectId && projectId !== 'sample-project';
  const hasToken = !!token;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Sanity Client Configuration:', {
      projectId: projectId || 'undefined',
      dataset,
      hasToken,
      isRealProject: hasRealProjectId
    });
  }
  
  // Use mock client for sample project or development without real config
  if (!hasRealProjectId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Using mock Sanity client (no real project configured)');
    }
    return createMockClient();
  }

  // Create real client
  const clientConfig = {
    projectId,
    dataset,
    apiVersion,
    useCdn: config.sanity.useCdn,
    ...(token && { token }), // Only add token if it exists
  };

  const realClient = createClient(clientConfig);
  
  // For development without token, provide fallback for write operations
  if (!token) {
    console.warn('⚠️ No Sanity API token provided. Write operations will use mock responses.');
    
    // Wrap client to provide mock responses for write operations
    return {
      ...realClient,
      fetch: realClient.fetch.bind(realClient),
      create: async (doc: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Mock create operation for:', doc._type);
        }
        return {
          _id: `mock_${doc._type}_${Date.now()}`,
          _type: doc._type,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: 'mock_rev',
          ...doc
        };
      },
      patch: (id: string) => ({
        set: async (data: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Mock patch operation for:', id);
          }
          return { _id: id, ...data };
        },
        unset: async (fields: string[]) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Mock unset operation for:', id, fields);
          }
          return { _id: id };
        },
        commit: async () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Mock commit operation for:', id);
          }
          return { _id: id };
        }
      })
    };
  }

  return realClient;
};

// Create client
export const client = createSanityClient();

// Create a write-enabled client specifically for server-side operations
export const writeClient = (() => {
  if (projectId === 'sample-project' || !token) {
    return createMockClient();
  }
  
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Don't use CDN for write operations
    token,
  });
})();

const builder = imageUrlBuilder(
  projectId === 'sample-project' 
    ? { projectId: 'sample', dataset: 'production' } as any // Mock builder
    : createClient({ projectId, dataset, apiVersion, useCdn: true })
);

export function urlForImage(source: SanityImageSource) {
  // If the source already contains a resolved URL, just return a helper wrapper
  if (typeof source === 'object' && source && 'url' in source) {
    return { url: () => (source as any).url as string };
  }
  // Preserve the mock-project override
  if (projectId === 'sample-project') {
    return { url: () => '/images/placeholder.jpg' };
  }
  return builder.image(source);
}

// Helper function to check if we can write to Sanity
export const canWriteToSanity = () => {
  return projectId !== 'sample-project' && !!token;
};

// Helper function to get appropriate client for write operations
export const getWriteClient = () => {
  return writeClient;
};

// GROQ query helpers
export const memorialBySlugQuery = `*[_type == "memorial" && slug.current == $slug][0]{
  _id,
  title,
  name,
  slug,
  born,
  died,
  personalInfo,
  biography,
  storyBlocks,
  gallery,
  heroImage,
  nfcIntegration,
  status,
  guestbookSettings,
  privacy
}`;

export const allMemorialsQuery = `*[_type == "memorial"] | order(_createdAt desc) {
  _id,
  title,
  name,
  slug,
  born,
  died,
  personalInfo,
  gallery,
  heroImage,
  status
}`;

export const guestbookEntriesQuery = `*[_type == "guestbookEntry" && memorial._ref == $memorialId && status == "approved"] | order(_createdAt desc) {
  _id,
  author,
  message,
  createdAt,
  reactions,
  status
}`; 
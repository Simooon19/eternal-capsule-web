import { unstable_cache } from 'next/cache';
import React from 'react';

// Cache configuration
export const cacheConfig = {
  // Memorial data - cache for 5 minutes (updates aren't frequent)
  memorial: {
    ttl: 5 * 60, // 5 minutes
    revalidate: 60, // Revalidate every minute for ISR
    tags: ['memorial'],
  },
  
  // Guestbook entries - cache for 1 minute (more frequent updates)
  guestbook: {
    ttl: 60, // 1 minute
    revalidate: 30, // Revalidate every 30 seconds
    tags: ['guestbook'],
  },
  
  // Analytics data - cache for 15 minutes (aggregated data)
  analytics: {
    ttl: 15 * 60, // 15 minutes
    revalidate: 5 * 60, // Revalidate every 5 minutes
    tags: ['analytics'],
  },
  
  // Images and static content - cache for 1 hour
  static: {
    ttl: 60 * 60, // 1 hour
    revalidate: 60 * 60, // Revalidate every hour
    tags: ['static'],
  },
  
  // Search results - cache for 10 minutes
  search: {
    ttl: 10 * 60, // 10 minutes
    revalidate: 5 * 60, // Revalidate every 5 minutes
    tags: ['search'],
  },
};

// In-memory cache for development and as fallback
class MemoryCache {
  private cache = new Map<string, { 
    data: any; 
    expiry: number; 
    tags: string[] 
  }>();

  set(key: string, data: any, ttl: number, tags: string[] = []): void {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expiry, tags });
  }

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache();

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}

// Cache key generators
export const cacheKeys = {
  memorial: (slug: string) => `memorial:${slug}`,
  memorialList: (filters?: string) => `memorials:list${filters ? `:${filters}` : ''}`,
  guestbook: (memorialId: string) => `guestbook:${memorialId}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  search: (query: string, filters: string) => `search:${query}:${filters}`,
  image: (assetId: string, transform?: string) => `image:${assetId}${transform ? `:${transform}` : ''}`,
  performance: (memorialId: string, timeframe: string) => `performance:${memorialId}:${timeframe}`,
};

// Cached function wrappers using Next.js cache
export const cachedMemorial = unstable_cache(
  async (slug: string) => {
    // This will be replaced with actual Sanity query
    return null;
  },
  ['memorial'],
  {
    revalidate: cacheConfig.memorial.revalidate,
    tags: cacheConfig.memorial.tags,
  }
);

export const cachedGuestbook = unstable_cache(
  async (memorialId: string) => {
    // This will be replaced with actual Sanity query
    return [];
  },
  ['guestbook'],
  {
    revalidate: cacheConfig.guestbook.revalidate,
    tags: cacheConfig.guestbook.tags,
  }
);

export const cachedAnalytics = unstable_cache(
  async (type: string, period: string) => {
    // This will be replaced with actual analytics query
    return null;
  },
  ['analytics'],
  {
    revalidate: cacheConfig.analytics.revalidate,
    tags: cacheConfig.analytics.tags,
  }
);

// Generic cache utilities
export class CacheManager {
  // Get from cache with fallback
  static async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: { ttl: number; tags?: string[] }
  ): Promise<T> {
    // Try memory cache first
    const cached = memoryCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Store in memory cache
    memoryCache.set(key, data, config.ttl, config.tags || []);
    
    return data;
  }

  // Set cache data
  static set<T>(
    key: string,
    data: T,
    config: { ttl: number; tags?: string[] }
  ): void {
    memoryCache.set(key, data, config.ttl, config.tags || []);
  }

  // Delete specific key
  static delete(key: string): boolean {
    return memoryCache.delete(key);
  }

  // Invalidate by tag
  static invalidateTag(tag: string): void {
    memoryCache.invalidateByTag(tag);
  }

  // Clear all cache
  static clear(): void {
    memoryCache.clear();
  }
}

// Cache warming utilities
export class CacheWarmer {
  // Warm frequently accessed data
  static async warmMemorialCache(popularSlugs: string[]): Promise<void> {
    const promises = popularSlugs.map(slug => 
      cachedMemorial(slug).catch(err => {
        console.warn(`Failed to warm cache for memorial ${slug}:`, err);
      })
    );
    
    await Promise.allSettled(promises);
  }

  // Warm analytics cache
  static async warmAnalyticsCache(): Promise<void> {
    const periods = ['24h', '7d', '30d'];
    const types = ['performance', 'interactions'];
    
    const promises = periods.flatMap(period =>
      types.map(type =>
        cachedAnalytics(type, period).catch(err => {
          console.warn(`Failed to warm analytics cache for ${type}:${period}:`, err);
        })
      )
    );
    
    await Promise.allSettled(promises);
  }
}

// Cache middleware for API routes
export function withCache<T>(
  handler: () => Promise<T>,
  config: {
    key: string;
    ttl: number;
    tags?: string[];
    condition?: () => boolean;
  }
) {
  return async (): Promise<T> => {
    // Check condition if provided
    if (config.condition && !config.condition()) {
      return handler();
    }

    return CacheManager.get(config.key, handler, {
      ttl: config.ttl,
      tags: config.tags,
    });
  };
}

// Client-side cache for browser
export class ClientCache {
  private static readonly PREFIX = 'eternal_cache_';
  
  // Get from localStorage with expiry check
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;
      
      const { data, expiry } = JSON.parse(item);
      
      if (Date.now() > expiry) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }

  // Set to localStorage with expiry
  static set<T>(key: string, data: T, ttlSeconds: number): void {
    if (typeof window === 'undefined') return;
    
    try {
      const item = {
        data,
        expiry: Date.now() + (ttlSeconds * 1000),
      };
      
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set client cache:', error);
    }
  }

  // Remove from localStorage
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.PREFIX + key);
  }

  // Clear all app cache from localStorage
  static clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Clean up expired items
  static cleanup(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const { expiry } = JSON.parse(item);
            if (now > expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Initialize client cache cleanup on page load
if (typeof window !== 'undefined') {
  // Clean up on page load
  ClientCache.cleanup();
  
  // Clean up every 10 minutes
  setInterval(() => {
    ClientCache.cleanup();
  }, 10 * 60 * 1000);
}

// Hook for using client cache in React components
export function useClientCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // 5 minutes default
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        const cached = ClientCache.get<T>(key);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        setLoading(true);
        const freshData = await fetcher();
        
        // Cache the result
        ClientCache.set(key, freshData, ttlSeconds);
        setData(freshData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttlSeconds]);

  const invalidate = React.useCallback(() => {
    ClientCache.remove(key);
    setData(null);
    setLoading(true);
  }, [key]);

  return {
    data,
    loading,
    error,
    invalidate,
  };
}

 
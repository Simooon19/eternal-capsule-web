import { client } from '@/lib/sanity';
import { Memorial } from '@/types/memorial';

// Search configuration
export interface SearchFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  funeralHome?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  tags?: string[];
  mediaType?: 'photos' | 'videos' | 'audio' | 'documents';
  sortBy?: 'relevance' | 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  memorial: Memorial;
  score: number;
  highlights?: {
    field: string;
    snippet: string;
  }[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: {
    funeralHomes: { name: string; count: number }[];
    locations: { location: string; count: number }[];
    years: { year: number; count: number }[];
    tags: { tag: string; count: number }[];
  };
  suggestions?: string[];
}

// Main search function
export async function searchMemorials(
  query: string,
  filters: SearchFilters = {},
  userId?: string
): Promise<SearchResponse> {
  try {
    // Build the GROQ query
    const groqQuery = buildSearchQuery(query, filters, userId);
    
    // Execute the search
    const results = await client.fetch(groqQuery.query, groqQuery.params);
    
    // Get facets for filtering UI
    const facets = await getFacets(query, filters, userId);
    
    // Generate search suggestions
    const suggestions = await generateSuggestions(query);
    
    // Process and score results
    const processedResults = processSearchResults(results, query);
    
    return {
      results: processedResults,
      total: results.length,
      facets,
      suggestions,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      results: [],
      total: 0,
      facets: {
        funeralHomes: [],
        locations: [],
        years: [],
        tags: [],
      },
    };
  }
}

// Build GROQ search query
function buildSearchQuery(
  query: string,
  filters: SearchFilters,
  userId?: string
): { query: string; params: Record<string, any> } {
  const params: Record<string, any> = {};
  let whereConditions = ['_type == "memorial"'];
  
  // Privacy filter - only show public memorials or user's own
  if (userId) {
    whereConditions.push(`(privacy->level == "public" || createdBy._ref == $userId)`);
    params.userId = userId;
  } else {
    whereConditions.push(`privacy->level == "public"`);
  }
  
  // Text search conditions
  if (query.trim()) {
    const searchTerms = query.trim().split(/\s+/).map((term, index) => {
      params[`term${index}`] = `*${term.toLowerCase()}*`;
      return `(
        pt::text(personalInfo.fullName) match $term${index} ||
        pt::text(lifeStory) match $term${index} ||
        pt::text(biography) match $term${index} ||
        pt::text(timeline[].title) match $term${index} ||
        pt::text(timeline[].description) match $term${index} ||
        pt::text(guestbook[].message) match $term${index} ||
        pt::text(tags) match $term${index}
      )`;
    });
    whereConditions.push(`(${searchTerms.join(' && ')})`);
  }
  
  // Date range filter
  if (filters.dateRange?.start || filters.dateRange?.end) {
    if (filters.dateRange.start) {
      whereConditions.push(`personalInfo.dateOfDeath >= $startDate`);
      params.startDate = filters.dateRange.start;
    }
    if (filters.dateRange.end) {
      whereConditions.push(`personalInfo.dateOfDeath <= $endDate`);
      params.endDate = filters.dateRange.end;
    }
  }
  
  // Funeral home filter
  if (filters.funeralHome) {
    whereConditions.push(`funeralHome._ref == $funeralHome`);
    params.funeralHome = filters.funeralHome;
  }
  
  // Location filter
  if (filters.location) {
    if (filters.location.city) {
      whereConditions.push(`personalInfo.location.city match $city`);
      params.city = `*${filters.location.city}*`;
    }
    if (filters.location.state) {
      whereConditions.push(`personalInfo.location.state match $state`);
      params.state = `*${filters.location.state}*`;
    }
    if (filters.location.country) {
      whereConditions.push(`personalInfo.location.country match $country`);
      params.country = `*${filters.location.country}*`;
    }
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    whereConditions.push(`count(tags[@ in $tags]) > 0`);
    params.tags = filters.tags;
  }
  
  // Media type filter
  if (filters.mediaType) {
    switch (filters.mediaType) {
      case 'photos':
        whereConditions.push(`count(gallery[_type == "image"]) > 0`);
        break;
      case 'videos':
        whereConditions.push(`count(gallery[_type == "video"]) > 0`);
        break;
      case 'audio':
        whereConditions.push(`count(gallery[_type == "audio"]) > 0`);
        break;
      case 'documents':
        whereConditions.push(`count(gallery[_type == "file"]) > 0`);
        break;
    }
  }
  
  // Build sorting
  let orderBy = '';
  switch (filters.sortBy) {
    case 'date_desc':
      orderBy = 'order(personalInfo.dateOfDeath desc)';
      break;
    case 'date_asc':
      orderBy = 'order(personalInfo.dateOfDeath asc)';
      break;
    case 'name_asc':
      orderBy = 'order(personalInfo.fullName asc)';
      break;
    case 'name_desc':
      orderBy = 'order(personalInfo.fullName desc)';
      break;
    default:
      // Relevance scoring (default)
      orderBy = 'order(_score desc)';
      break;
  }
  
  // Build pagination
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  
  const searchQuery = `
    *[${whereConditions.join(' && ')}] | ${orderBy} [${offset}...${offset + limit}] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      personalInfo,
      lifeStory,
      biography,
      gallery[] {
        _key,
        _type,
        asset-> {
          _id,
          url,
          metadata
        },
        caption,
        altText
      },
      timeline[] {
        _key,
        title,
        description,
        date,
        photos
      },
      guestbook[] {
        _key,
        author,
        message,
        createdAt,
        reactions
      }[0...5], // Limit guestbook entries for search results
      tags,
      privacy,
      nfcTag,
      qrCode,
      funeralHome-> {
        _id,
        name,
        location
      },
      slug,
      _score
    }
  `;
  
  return { query: searchQuery, params };
}

// Get search facets for filtering
async function getFacets(
  query: string,
  filters: SearchFilters,
  userId?: string
): Promise<SearchResponse['facets']> {
  try {
    // Build base conditions (same as search but without specific filters)
    let baseConditions = ['_type == "memorial"'];
    
    if (userId) {
      baseConditions.push(`(privacy->level == "public" || createdBy._ref == "${userId}")`);
    } else {
      baseConditions.push(`privacy->level == "public"`);
    }
    
    // Add text search if provided
    if (query.trim()) {
      const searchCondition = `(
        pt::text(personalInfo.fullName) match "*${query.toLowerCase()}*" ||
        pt::text(lifeStory) match "*${query.toLowerCase()}*" ||
        pt::text(biography) match "*${query.toLowerCase()}*"
      )`;
      baseConditions.push(searchCondition);
    }
    
    const baseWhere = baseConditions.join(' && ');
    
    // Get funeral homes facet
    const funeralHomesQuery = `
      *[${baseWhere}] {
        "funeralHome": funeralHome->name
      } | group(funeralHome) {
        "name": funeralHome,
        "count": length(@)
      } | order(count desc)
    `;
    
    // Get locations facet
    const locationsQuery = `
      *[${baseWhere}] {
        "location": personalInfo.location.city + ", " + personalInfo.location.state
      } | group(location) {
        "location": location,
        "count": length(@)
      } | order(count desc)
    `;
    
    // Get years facet
    const yearsQuery = `
      *[${baseWhere}] {
        "year": dateTime(personalInfo.dateOfDeath).year
      } | group(year) {
        "year": year,
        "count": length(@)
      } | order(year desc)
    `;
    
    // Get tags facet
    const tagsQuery = `
      *[${baseWhere}] {
        "tags": tags[]
      } | project(tags) | group(tags) {
        "tag": tags,
        "count": length(@)
      } | order(count desc)
    `;
    
    const [funeralHomes, locations, years, tags] = await Promise.all([
      client.fetch(funeralHomesQuery),
      client.fetch(locationsQuery),
      client.fetch(yearsQuery),
      client.fetch(tagsQuery),
    ]);
    
    return {
      funeralHomes: funeralHomes.filter((f: any) => f.name),
      locations: locations.filter((l: any) => l.location),
      years: years.filter((y: any) => y.year),
      tags: tags.filter((t: any) => t.tag),
    };
  } catch (error) {
    console.error('Error getting facets:', error);
    return {
      funeralHomes: [],
      locations: [],
      years: [],
      tags: [],
    };
  }
}

// Generate search suggestions
async function generateSuggestions(query: string): Promise<string[]> {
  if (query.length < 3) return [];
  
  try {
    const suggestionsQuery = `
      *[_type == "memorial" && privacy->level == "public"] {
        "names": [personalInfo.fullName, personalInfo.preferredName],
        "locations": [personalInfo.location.city, personalInfo.location.state],
        "tags": tags[]
      }
    `;
    
    const results = await client.fetch(suggestionsQuery);
    
    const allTerms = new Set<string>();
    
    results.forEach((result: any) => {
      [...(result.names || []), ...(result.locations || []), ...(result.tags || [])]
        .filter(Boolean)
        .forEach((term: string) => {
          if (term.toLowerCase().includes(query.toLowerCase())) {
            allTerms.add(term);
          }
        });
    });
    
    return Array.from(allTerms).slice(0, 5);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

// Process and score search results
function processSearchResults(results: any[], query: string): SearchResult[] {
  return results.map((memorial) => {
    const score = calculateRelevanceScore(memorial, query);
    const highlights = generateHighlights(memorial, query);
    
    return {
      memorial,
      score,
      highlights,
    };
  });
}

// Calculate relevance score
function calculateRelevanceScore(memorial: any, query: string): number {
  if (!query.trim()) return 1;
  
  const terms = query.toLowerCase().split(/\s+/);
  let score = 0;
  
  // Score based on name match (highest weight)
  const fullName = memorial.personalInfo?.fullName?.toLowerCase() || '';
  terms.forEach(term => {
    if (fullName.includes(term)) {
      score += fullName === term ? 10 : 5; // Exact match vs partial
    }
  });
  
  // Score based on biography/life story match
  const biography = (memorial.biography || '').toLowerCase();
  const lifeStory = (memorial.lifeStory || '').toLowerCase();
  terms.forEach(term => {
    if (biography.includes(term)) score += 2;
    if (lifeStory.includes(term)) score += 2;
  });
  
  // Score based on tags match
  const tags = (memorial.tags || []).map((tag: string) => tag.toLowerCase());
  terms.forEach(term => {
    tags.forEach((tag: string) => {
      if (tag.includes(term)) score += 3;
    });
  });
  
  // Score based on timeline match
  const timeline = memorial.timeline || [];
  terms.forEach(term => {
    timeline.forEach((event: any) => {
      if ((event.title || '').toLowerCase().includes(term)) score += 1;
      if ((event.description || '').toLowerCase().includes(term)) score += 1;
    });
  });
  
  return score;
}

// Generate search highlights
function generateHighlights(memorial: any, query: string): { field: string; snippet: string }[] {
  if (!query.trim()) return [];
  
  const highlights: { field: string; snippet: string }[] = [];
  const terms = query.toLowerCase().split(/\s+/);
  
  // Highlight in name
  const fullName = memorial.personalInfo?.fullName || '';
  if (terms.some(term => fullName.toLowerCase().includes(term))) {
    highlights.push({
      field: 'name',
      snippet: highlightText(fullName, terms),
    });
  }
  
  // Highlight in biography
  const biography = memorial.biography || '';
  if (terms.some(term => biography.toLowerCase().includes(term))) {
    highlights.push({
      field: 'biography',
      snippet: highlightText(biography, terms, 150),
    });
  }
  
  // Highlight in life story
  const lifeStory = memorial.lifeStory || '';
  if (terms.some(term => lifeStory.toLowerCase().includes(term))) {
    highlights.push({
      field: 'lifeStory',
      snippet: highlightText(lifeStory, terms, 150),
    });
  }
  
  return highlights;
}

// Highlight matching terms in text
function highlightText(text: string, terms: string[], maxLength = 0): string {
  let highlightedText = text;
  
  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  if (maxLength > 0 && highlightedText.length > maxLength) {
    // Find the first highlight and create a snippet around it
    const markIndex = highlightedText.indexOf('<mark>');
    if (markIndex !== -1) {
      const start = Math.max(0, markIndex - 50);
      const end = Math.min(highlightedText.length, markIndex + maxLength - 50);
      highlightedText = '...' + highlightedText.substring(start, end) + '...';
    } else {
      highlightedText = highlightedText.substring(0, maxLength) + '...';
    }
  }
  
  return highlightedText;
}

// Escape regex special characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Advanced search with natural language processing
export async function advancedSearch(
  query: string,
  options: {
    fuzzyMatch?: boolean;
    synonyms?: boolean;
    dateNLP?: boolean; // "memorials from last year", "people who died in 2020"
    locationNLP?: boolean; // "memorials in New York", "people from California"
  } = {}
): Promise<SearchResponse> {
  let processedQuery = query;
  let additionalFilters: SearchFilters = {};
  
  // Process natural language date queries
  if (options.dateNLP) {
    const dateFilters = extractDateFromQuery(query);
    if (dateFilters) {
      additionalFilters.dateRange = dateFilters;
      processedQuery = processedQuery.replace(/\b(last|this|from|in)\s+(year|month|decade|\d{4})\b/gi, '').trim();
    }
  }
  
  // Process natural language location queries
  if (options.locationNLP) {
    const locationFilters = extractLocationFromQuery(query);
    if (locationFilters) {
      additionalFilters.location = locationFilters;
      processedQuery = processedQuery.replace(/\b(in|from|at)\s+([A-Za-z\s]+)(?:,\s*[A-Za-z\s]+)?\b/gi, '').trim();
    }
  }
  
  // Add synonym expansion if enabled
  if (options.synonyms) {
    processedQuery = expandSynonyms(processedQuery);
  }
  
  return searchMemorials(processedQuery, additionalFilters);
}

// Extract date filters from natural language
function extractDateFromQuery(query: string): SearchFilters['dateRange'] | null {
  const currentYear = new Date().getFullYear();
  
  if (/\blast year\b/i.test(query)) {
    return {
      start: `${currentYear - 1}-01-01`,
      end: `${currentYear - 1}-12-31`,
    };
  }
  
  if (/\bthis year\b/i.test(query)) {
    return {
      start: `${currentYear}-01-01`,
      end: `${currentYear}-12-31`,
    };
  }
  
  const yearMatch = query.match(/\b(\d{4})\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 1900 && year <= currentYear) {
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      };
    }
  }
  
  return null;
}

// Extract location filters from natural language
function extractLocationFromQuery(query: string): SearchFilters['location'] | null {
  const locationMatch = query.match(/\b(?:in|from|at)\s+([A-Za-z\s]+?)(?:,\s*([A-Za-z\s]+))?\b/i);
  
  if (locationMatch) {
    return {
      city: locationMatch[1]?.trim(),
      state: locationMatch[2]?.trim(),
    };
  }
  
  return null;
}

// Expand query with synonyms
function expandSynonyms(query: string): string {
  const synonyms: Record<string, string[]> = {
    died: ['passed away', 'deceased', 'departed', 'lost'],
    born: ['birth', 'birthday'],
    family: ['relatives', 'loved ones', 'kin'],
    memorial: ['tribute', 'remembrance', 'commemoration'],
    funeral: ['service', 'ceremony', 'celebration of life'],
  };
  
  let expandedQuery = query;
  
  Object.entries(synonyms).forEach(([word, syns]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(expandedQuery)) {
      expandedQuery += ' ' + syns.join(' ');
    }
  });
  
  return expandedQuery;
}

// Save search analytics
export async function logSearch(
  query: string,
  filters: SearchFilters,
  resultsCount: number,
  userId?: string
): Promise<void> {
  try {
    const searchLog = {
      _type: 'searchLog',
      query: query.trim(),
      filters,
      resultsCount,
      timestamp: new Date().toISOString(),
      userId: userId || null,
      sessionId: generateSessionId(),
    };
    
    await client.create(searchLog);
  } catch (error) {
    console.error('Error logging search:', error);
  }
}

// Generate session ID for analytics
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get popular searches
export async function getPopularSearches(limit = 10): Promise<{ query: string; count: number }[]> {
  try {
    const popularSearchesQuery = `
      *[_type == "searchLog" && _createdAt > dateTime(now()) - 60*60*24*30] { // Last 30 days
        query
      } | group(query) {
        "query": query,
        "count": length(@)
      } | order(count desc) [0...${limit}]
    `;
    
    return await client.fetch(popularSearchesQuery);
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
} 
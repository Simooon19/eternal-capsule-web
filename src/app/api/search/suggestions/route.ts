import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

interface SearchSuggestion {
  text: string;
  type: 'query' | 'location' | 'name' | 'tag';
  count?: number;
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q')?.toLowerCase() || '';
      
      if (query.length < 2) {
        return NextResponse.json({ suggestions: [] });
      }

      // Get suggestions from multiple sources
      const [nameSuggestions, locationSuggestions, tagSuggestions, popularQueries] = await Promise.all([
        getNameSuggestions(query),
        getLocationSuggestions(query),
        getTagSuggestions(query),
        getPopularQueries(query)
      ]);

      // Combine and rank suggestions
      const allSuggestions = [
        ...nameSuggestions,
        ...locationSuggestions,
        ...tagSuggestions,
        ...popularQueries
      ];

      // Sort by relevance (exact matches first, then by count)
      const sortedSuggestions = allSuggestions.sort((a, b) => {
        // Exact matches first
        if (a.text.toLowerCase() === query && b.text.toLowerCase() !== query) return -1;
        if (b.text.toLowerCase() === query && a.text.toLowerCase() !== query) return 1;
        
        // Then by starts with
        const aStartsWith = a.text.toLowerCase().startsWith(query);
        const bStartsWith = b.text.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (bStartsWith && !aStartsWith) return 1;
        
        // Then by count (higher first)
        return (b.count || 0) - (a.count || 0);
      });

      // Limit to top 8 suggestions
      const limitedSuggestions = sortedSuggestions.slice(0, 8);

      return NextResponse.json({ suggestions: limitedSuggestions });
    } catch (error) {
      console.error('Suggestions API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }
  });
}

async function getNameSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    const groqQuery = `*[_type == "memorial" && privacy->level == "public" && pt::text(personalInfo.fullName) match $query][0...5] {
      "text": personalInfo.fullName,
      _id
    }`;
    
    const results = await client.fetch(groqQuery, { query: `*${query}*` });
    
    return results.map((result: any) => ({
      text: result.text,
      type: 'name' as const,
      count: 1
    }));
  } catch (error) {
    console.error('Name suggestions error:', error);
    return [];
  }
}

async function getLocationSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    const groqQuery = `*[_type == "memorial" && privacy->level == "public" && (
      personalInfo.location.city match $query ||
      personalInfo.location.state match $query ||
      personalInfo.location.country match $query
    )][0...5] {
      "city": personalInfo.location.city,
      "state": personalInfo.location.state,
      "country": personalInfo.location.country
    }`;
    
    const results = await client.fetch(groqQuery, { query: `*${query}*` });
    
    // Create location suggestions
    const locationSet = new Set<string>();
    const suggestions: SearchSuggestion[] = [];
    
    results.forEach((result: any) => {
      if (result.city && result.city.toLowerCase().includes(query)) {
        const location = result.state ? `${result.city}, ${result.state}` : result.city;
        if (!locationSet.has(location)) {
          locationSet.add(location);
          suggestions.push({
            text: location,
            type: 'location',
            count: 1
          });
        }
      }
      
      if (result.state && result.state.toLowerCase().includes(query) && !result.city?.toLowerCase().includes(query)) {
        if (!locationSet.has(result.state)) {
          locationSet.add(result.state);
          suggestions.push({
            text: result.state,
            type: 'location',
            count: 1
          });
        }
      }
    });
    
    return suggestions;
  } catch (error) {
    console.error('Location suggestions error:', error);
    return [];
  }
}

async function getTagSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    const groqQuery = `*[_type == "memorial" && privacy->level == "public" && count(tags[@ match $query]) > 0][0...10] {
      tags
    }`;
    
    const results = await client.fetch(groqQuery, { query: `*${query}*` });
    
    // Count tag occurrences
    const tagCounts = new Map<string, number>();
    
    results.forEach((result: any) => {
      if (result.tags) {
        result.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(query)) {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          }
        });
      }
    });
    
    // Convert to suggestions
    const suggestions: SearchSuggestion[] = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        text: tag,
        type: 'tag' as const,
        count
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5);
    
    return suggestions;
  } catch (error) {
    console.error('Tag suggestions error:', error);
    return [];
  }
}

async function getPopularQueries(query: string): Promise<SearchSuggestion[]> {
  try {
    // This would typically come from search analytics
    // For now, return some common memorial-related search terms
    const commonTerms = [
      'family', 'father', 'mother', 'husband', 'wife', 'grandfather', 'grandmother',
      'beloved', 'passed away', 'memorial', 'funeral', 'service', 'celebration of life',
      'obituary', 'remembrance', 'tribute', 'in memory', 'loving', 'cherished'
    ];
    
    const matchingTerms = commonTerms.filter(term => 
      term.toLowerCase().includes(query) || query.includes(term.toLowerCase())
    );
    
    return matchingTerms.slice(0, 3).map(term => ({
      text: term,
      type: 'query' as const,
      count: Math.floor(Math.random() * 50) + 10 // Mock count
    }));
  } catch (error) {
    console.error('Popular queries error:', error);
    return [];
  }
} 
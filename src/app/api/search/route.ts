import { NextRequest, NextResponse } from 'next/server';
import { searchMemorials, advancedSearch, logSearch, type SearchFilters } from '@/lib/search';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const { searchParams } = new URL(request.url);
      
      const query = searchParams.get('q') || '';
      const filters: SearchFilters = {};
      
      // Parse filters from query parameters
      if (searchParams.get('funeral_home')) {
        filters.funeralHome = searchParams.get('funeral_home')!;
      }
      
      if (searchParams.get('start_date') || searchParams.get('end_date')) {
        filters.dateRange = {
          start: searchParams.get('start_date') || undefined,
          end: searchParams.get('end_date') || undefined,
        };
      }
      
      if (searchParams.get('city') || searchParams.get('state') || searchParams.get('country')) {
        filters.location = {
          city: searchParams.get('city') || undefined,
          state: searchParams.get('state') || undefined,
          country: searchParams.get('country') || undefined,
        };
      }
      
      if (searchParams.get('tags')) {
        filters.tags = searchParams.get('tags')!.split(',').map(tag => tag.trim());
      }
      
      if (searchParams.get('media_type')) {
        filters.mediaType = searchParams.get('media_type') as any;
      }
      
      if (searchParams.get('sort_by')) {
        filters.sortBy = searchParams.get('sort_by') as any;
      }
      
      if (searchParams.get('limit')) {
        filters.limit = parseInt(searchParams.get('limit')!);
      }
      
      if (searchParams.get('offset')) {
        filters.offset = parseInt(searchParams.get('offset')!);
      }
      
      // Check for advanced search options
      const useAdvanced = searchParams.get('advanced') === 'true';
      const fuzzyMatch = searchParams.get('fuzzy') === 'true';
      const synonyms = searchParams.get('synonyms') === 'true';
      const dateNLP = searchParams.get('date_nlp') === 'true';
      const locationNLP = searchParams.get('location_nlp') === 'true';
      
      // Get user ID from headers (if authenticated)
      const userId = request.headers.get('x-user-id');
      
      // Perform search
      let results;
      if (useAdvanced) {
        results = await advancedSearch(query, {
          fuzzyMatch,
          synonyms,
          dateNLP,
          locationNLP,
        });
      } else {
        results = await searchMemorials(query, filters, userId || undefined);
      }
      
      // Log the search for analytics
      await logSearch(query, filters, results.total, userId || undefined);
      
      return NextResponse.json(results);
    } catch (error) {
      console.error('Search API error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const body = await request.json();
      const { query, filters = {}, advanced = false, options = {} } = body;
      
      if (!query || typeof query !== 'string') {
        return NextResponse.json(
          { error: 'Query is required and must be a string' },
          { status: 400 }
        );
      }
      
      // Get user ID from headers (if authenticated)
      const userId = request.headers.get('x-user-id');
      
      // Perform search
      let results;
      if (advanced) {
        results = await advancedSearch(query, options);
      } else {
        results = await searchMemorials(query, filters, userId || undefined);
      }
      
      // Log the search for analytics
      await logSearch(query, filters, results.total, userId || undefined);
      
      return NextResponse.json(results);
    } catch (error) {
      console.error('Search API error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }
  });
} 
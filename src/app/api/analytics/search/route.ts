import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const period = searchParams.get('period') || '7'; // days
      const type = searchParams.get('type') || 'overview';

      const periodDays = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      switch (type) {
        case 'overview':
          return NextResponse.json(await getSearchOverview(startDate));
        case 'popular':
          return NextResponse.json(await getPopularSearches(startDate));
        case 'trends':
          return NextResponse.json(await getSearchTrends(startDate));
        case 'performance':
          return NextResponse.json(await getSearchPerformance(startDate));
        default:
          return NextResponse.json(await getSearchOverview(startDate));
      }
    } catch (error) {
      console.error('Search analytics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch search analytics' },
        { status: 500 }
      );
    }
  });
}

async function getSearchOverview(startDate: Date) {
  try {
    // Get search logs from Sanity
    const searchLogs = await client.fetch(`
      *[_type == "searchLog" && _createdAt >= $startDate] {
        query,
        resultsCount,
        userId,
        sessionId,
        _createdAt
      }
    `, { startDate: startDate.toISOString() });

    const totalSearches = searchLogs.length;
    const uniqueUsers = new Set(searchLogs.map((log: any) => log.userId || log.sessionId)).size;
    const avgResultsPerSearch = searchLogs.length > 0 
      ? searchLogs.reduce((sum: number, log: any) => sum + (log.resultsCount || 0), 0) / searchLogs.length 
      : 0;
    
    // Calculate zero-result searches
    const zeroResultSearches = searchLogs.filter((log: any) => log.resultsCount === 0).length;
    const zeroResultRate = totalSearches > 0 ? (zeroResultSearches / totalSearches) * 100 : 0;

    // Group by day for trend
    const dailySearches = searchLogs.reduce((acc: Record<string, number>, log: any) => {
      const day = new Date(log._createdAt).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSearches,
      uniqueUsers,
      avgResultsPerSearch: Math.round(avgResultsPerSearch * 100) / 100,
      zeroResultRate: Math.round(zeroResultRate * 100) / 100,
      dailyTrend: Object.entries(dailySearches).map(([date, count]) => ({
        date,
        searches: count
      })).sort((a, b) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    console.error('Search overview error:', error);
    return {
      totalSearches: 0,
      uniqueUsers: 0,
      avgResultsPerSearch: 0,
      zeroResultRate: 0,
      dailyTrend: []
    };
  }
}

async function getPopularSearches(startDate: Date) {
  try {
    const searchLogs = await client.fetch(`
      *[_type == "searchLog" && _createdAt >= $startDate && query != ""] {
        query,
        resultsCount,
        _createdAt
      }
    `, { startDate: startDate.toISOString() });

    // Count query frequencies
    const queryCounts = searchLogs.reduce((acc: Record<string, any>, log: any) => {
      const normalizedQuery = log.query.toLowerCase().trim();
      if (normalizedQuery) {
        if (!acc[normalizedQuery]) {
          acc[normalizedQuery] = {
            query: log.query,
            count: 0,
            totalResults: 0,
            avgResults: 0
          };
        }
        acc[normalizedQuery].count++;
        acc[normalizedQuery].totalResults += log.resultsCount || 0;
      }
      return acc;
    }, {});

    // Calculate averages and sort
    const popularQueries = Object.values(queryCounts)
      .map((item: any) => ({
        ...item,
        avgResults: item.count > 0 ? Math.round((item.totalResults / item.count) * 100) / 100 : 0
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 20);

    return { queries: popularQueries };
  } catch (error) {
    console.error('Popular searches error:', error);
    return { queries: [] };
  }
}

async function getSearchTrends(startDate: Date) {
  try {
    const searchLogs = await client.fetch(`
      *[_type == "searchLog" && _createdAt >= $startDate] {
        query,
        resultsCount,
        _createdAt
      }
    `, { startDate: startDate.toISOString() });

    // Group by hour for detailed trend
    const hourlySearches = searchLogs.reduce((acc: Record<string, number>, log: any) => {
      const hour = new Date(log._createdAt).toISOString().substring(0, 13);
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Analyze search patterns
    const searchTerms = searchLogs
      .map((log: any) => log.query.toLowerCase().trim())
      .filter((query: string) => query.length > 0);

    const termFrequency = searchTerms.reduce((acc: Record<string, number>, term: string) => {
      const words = term.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) { // Only count words longer than 2 characters
          acc[word] = (acc[word] || 0) + 1;
        }
      });
      return acc;
    }, {});

    const trendingTerms = Object.entries(termFrequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    return {
      hourlyTrend: Object.entries(hourlySearches)
        .map(([hour, count]) => ({ hour, searches: count }))
        .sort((a, b) => a.hour.localeCompare(b.hour)),
      trendingTerms
    };
  } catch (error) {
    console.error('Search trends error:', error);
    return {
      hourlyTrend: [],
      trendingTerms: []
    };
  }
}

async function getSearchPerformance(startDate: Date) {
  try {
    const searchLogs = await client.fetch(`
      *[_type == "searchLog" && _createdAt >= $startDate] {
        query,
        resultsCount,
        executionTime,
        _createdAt
      }
    `, { startDate: startDate.toISOString() });

    const avgExecutionTime = searchLogs.length > 0
      ? searchLogs.reduce((sum: number, log: any) => sum + (log.executionTime || 0), 0) / searchLogs.length
      : 0;

    // Performance buckets
    const performanceBuckets = {
      fast: 0,      // < 100ms
      medium: 0,    // 100-500ms
      slow: 0,      // 500ms-1s
      verySlow: 0   // > 1s
    };

    searchLogs.forEach((log: any) => {
      const time = log.executionTime || 0;
      if (time < 100) performanceBuckets.fast++;
      else if (time < 500) performanceBuckets.medium++;
      else if (time < 1000) performanceBuckets.slow++;
      else performanceBuckets.verySlow++;
    });

    // Query length analysis
    const queryLengths = searchLogs
      .map((log: any) => log.query.length)
      .filter((length: number) => length > 0);

    const avgQueryLength = queryLengths.length > 0
      ? queryLengths.reduce((sum: number, length: number) => sum + length, 0) / queryLengths.length
      : 0;

    return {
      avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
      performanceBuckets,
      avgQueryLength: Math.round(avgQueryLength * 100) / 100,
      totalQueries: searchLogs.length
    };
  } catch (error) {
    console.error('Search performance error:', error);
    return {
      avgExecutionTime: 0,
      performanceBuckets: { fast: 0, medium: 0, slow: 0, verySlow: 0 },
      avgQueryLength: 0,
      totalQueries: 0
    };
  }
} 
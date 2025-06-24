import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      // TODO: Add authentication check when Prisma is properly configured
      // For now, allowing access for testing purposes

      const { searchParams } = new URL(request.url);
      const timeRange = searchParams.get('range') || '30d';

      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 30;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Fetch business metrics from various sources
      const [
        memorialStats,
        funeralHomeStats,
        guestbookStats,
        performanceMetrics,
        searchStats
      ] = await Promise.all([
        getMemorialMetrics(startDate),
        getFuneralHomeMetrics(startDate),
        getGuestbookMetrics(startDate),
        getPerformanceMetrics(),
        getSearchMetrics(startDate)
      ]);

      // Calculate revenue from subscription data (mock data for now)
      const revenue = calculateRevenue(funeralHomeStats, timeRange);

      const businessMetrics = {
        revenue: {
          total: revenue.total,
          monthly: revenue.monthly,
          quarterly: revenue.quarterly,
          yearly: revenue.yearly,
          growth: revenue.growth,
        },
        subscriptions: {
          total: funeralHomeStats.total,
          active: funeralHomeStats.active,
          churned: funeralHomeStats.churned,
          new: funeralHomeStats.newThisMonth,
          byPlan: funeralHomeStats.byPlan,
        },
        usage: {
          totalMemorials: memorialStats.total,
          memorialsThisMonth: memorialStats.thisMonth,
          totalViews: memorialStats.totalViews,
          avgViewsPerMemorial: Math.round(memorialStats.totalViews / memorialStats.total) || 0,
          totalGuestbookEntries: guestbookStats.total,
        },
        funeralHomes: {
          total: funeralHomeStats.total,
          active: funeralHomeStats.active,
          inactive: funeralHomeStats.inactive,
          newThisMonth: funeralHomeStats.newThisMonth,
        },
        performance: {
          avgLoadTime: performanceMetrics.avgLoadTime,
          coreWebVitals: performanceMetrics.coreWebVitals,
          uptime: 99.9, // Mock uptime - would come from monitoring service
        },
        support: {
          totalTickets: 0, // Would integrate with support system
          openTickets: 0,
          avgResponseTime: 2.5,
          satisfaction: 94,
        },
        search: {
          totalSearches: searchStats.total,
          popularQueries: searchStats.popular,
          avgResultsPerSearch: searchStats.avgResults,
        }
      };

      return NextResponse.json(businessMetrics);

    } catch (error) {
      console.error('Business metrics API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch business metrics' },
        { status: 500 }
      );
    }
  });
}

// Helper functions to fetch data from different sources

async function getMemorialMetrics(startDate: Date) {
  try {
    const query = `{
      "total": count(*[_type == "memorial"]),
      "thisMonth": count(*[_type == "memorial" && _createdAt >= $startDate]),
      "published": count(*[_type == "memorial" && status == "published"]),
      "draft": count(*[_type == "memorial" && status == "draft"])
    }`;

    const result = await client.fetch(query, { 
      startDate: startDate.toISOString() 
    });

    return {
      total: result.total || 0,
      thisMonth: result.thisMonth || 0,
      published: result.published || 0,
      draft: result.draft || 0,
      totalViews: result.total * 50, // Mock view data - would come from analytics
    };
  } catch (error) {
    console.error('Error fetching memorial metrics:', error);
    return {
      total: 0,
      thisMonth: 0,
      published: 0,
      draft: 0,
      totalViews: 0,
    };
  }
}

async function getFuneralHomeMetrics(startDate: Date) {
  try {
    const query = `{
      "total": count(*[_type == "funeralHome"]),
      "newThisMonth": count(*[_type == "funeralHome" && _createdAt >= $startDate]),
      "byPlan": {
        "free": count(*[_type == "funeralHome" && subscription.plan == "free"]),
        "family": count(*[_type == "funeralHome" && subscription.plan == "family"]),
        "funeral": count(*[_type == "funeralHome" && subscription.plan == "funeral"]),
        "enterprise": count(*[_type == "funeralHome" && subscription.plan == "enterprise"])
      },
      "activeSubscriptions": count(*[_type == "funeralHome" && subscription.subscriptionStatus == "active"])
    }`;

    const result = await client.fetch(query, { 
      startDate: startDate.toISOString() 
    });

    return {
      total: result.total || 0,
      newThisMonth: result.newThisMonth || 0,
      active: result.activeSubscriptions || 0,
      inactive: (result.total || 0) - (result.activeSubscriptions || 0),
      churned: 0, // Would calculate from subscription changes
      byPlan: result.byPlan || { free: 0, family: 0, funeral: 0, enterprise: 0 },
    };
  } catch (error) {
    console.error('Error fetching funeral home metrics:', error);
    return {
      total: 0,
      newThisMonth: 0,
      active: 0,
      inactive: 0,
      churned: 0,
      byPlan: { free: 0, family: 0, funeral: 0, enterprise: 0 },
    };
  }
}

async function getGuestbookMetrics(startDate: Date) {
  try {
    const query = `{
      "total": count(*[_type == "guestbookEntry"]),
      "thisMonth": count(*[_type == "guestbookEntry" && _createdAt >= $startDate]),
      "approved": count(*[_type == "guestbookEntry" && status == "approved"]),
      "pending": count(*[_type == "guestbookEntry" && status == "pending"])
    }`;

    const result = await client.fetch(query, { 
      startDate: startDate.toISOString() 
    });

    return {
      total: result.total || 0,
      thisMonth: result.thisMonth || 0,
      approved: result.approved || 0,
      pending: result.pending || 0,
    };
  } catch (error) {
    console.error('Error fetching guestbook metrics:', error);
    return {
      total: 0,
      thisMonth: 0,
      approved: 0,
      pending: 0,
    };
  }
}

async function getPerformanceMetrics() {
  try {
    // Get performance data from global memory (as set up in your existing system)
    const performanceData = (global as any).performanceMetrics || [];
    
    if (performanceData.length === 0) {
      return {
        avgLoadTime: 0,
        coreWebVitals: {
          fcp: 0,
          lcp: 0,
          cls: 0,
          fid: 0,
        }
      };
    }

    // Calculate averages
    const totals = performanceData.reduce((acc: any, session: any) => {
      acc.loadTime += session.metrics.loadTime;
      acc.firstContentfulPaint += session.metrics.firstContentfulPaint;
      acc.largestContentfulPaint += session.metrics.largestContentfulPaint;
      acc.cumulativeLayoutShift += session.metrics.cumulativeLayoutShift;
      acc.timeToInteractive += session.metrics.timeToInteractive;
      return acc;
    }, {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
    });

    const count = performanceData.length;

    return {
      avgLoadTime: Math.round(totals.loadTime / count),
      coreWebVitals: {
        fcp: Math.round(totals.firstContentfulPaint / count),
        lcp: Math.round(totals.largestContentfulPaint / count),
        cls: (totals.cumulativeLayoutShift / count).toFixed(3),
        fid: Math.round(totals.timeToInteractive / count), // Using TTI as FID approximation
      }
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      avgLoadTime: 0,
      coreWebVitals: {
        fcp: 0,
        lcp: 0,
        cls: 0,
        fid: 0,
      }
    };
  }
}

async function getSearchMetrics(startDate: Date) {
  try {
    const query = `{
      "total": count(*[_type == "searchLog"]),
      "thisMonth": count(*[_type == "searchLog" && _createdAt >= $startDate]),
      "popular": []
    }`;

    const result = await client.fetch(query, { 
      startDate: startDate.toISOString() 
    });

    // Fetch search logs separately and process them manually
    const searchLogs = await client.fetch(
      `*[_type == "searchLog" && _createdAt >= $startDate] { query }`,
      { startDate: startDate.toISOString() }
    );

    // Group and count queries manually
    const queryCounts: Record<string, number> = {};
    searchLogs.forEach((log: any) => {
      if (log.query) {
        queryCounts[log.query] = (queryCounts[log.query] || 0) + 1;
      }
    });

    // Sort by count and take top 5
    const popular = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: result.total || 0,
      thisMonth: result.thisMonth || 0,
      popular: popular,
      avgResults: 5.2, // Mock average - would calculate from actual search logs
    };
  } catch (error) {
    console.error('Error fetching search metrics:', error);
    return {
      total: 0,
      thisMonth: 0,
      popular: [],
      avgResults: 0,
    };
  }
}

function calculateRevenue(funeralHomeStats: any, timeRange: string) {
  // Mock revenue calculation based on subscription plans
  // In reality, this would come from Stripe analytics
  const planPricing = {
    free: 0,
    family: 19,
    funeral: 99,
    enterprise: 249,
  };

  const monthlyRevenue = Object.entries(funeralHomeStats.byPlan).reduce((total, [plan, count]) => {
    return total + (planPricing[plan as keyof typeof planPricing] * (count as number));
  }, 0);

  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '90d' ? 3 : timeRange === '1y' ? 12 : 1;

  return {
    total: monthlyRevenue * 12, // Annual total
    monthly: monthlyRevenue,
    quarterly: monthlyRevenue * 3,
    yearly: monthlyRevenue * 12,
    growth: 15.2, // Mock growth percentage
  };
} 
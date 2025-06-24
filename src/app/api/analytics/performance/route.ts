import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface PerformanceData {
  memorialId: string;
  metrics: PerformanceMetrics;
  timestamp: string;
  userAgent: string;
  connectionType: string;
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.analytics, async () => {
    try {
    const data: PerformanceData = await request.json();

    // Validate required fields
    if (!data.memorialId || !data.metrics || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Store this data in your analytics database
    // 2. Send to analytics services like Google Analytics, Mixpanel, etc.
    // 3. Aggregate data for dashboard display
    
    // For now, we'll just log it and store in memory (for demo purposes)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics Received:', {
        memorialId: data.memorialId,
        loadTime: `${data.metrics.loadTime}ms`,
        firstContentfulPaint: `${data.metrics.firstContentfulPaint}ms`,
        largestContentfulPaint: `${data.metrics.largestContentfulPaint}ms`,
        cumulativeLayoutShift: data.metrics.cumulativeLayoutShift.toFixed(3),
        timeToInteractive: `${data.metrics.timeToInteractive}ms`,
        timestamp: data.timestamp,
        connectionType: data.connectionType,
      });
    }

    // Store in a simple in-memory cache (in production, use a proper database)
    if (typeof global !== 'undefined') {
      if (!(global as any).performanceMetrics) {
        (global as any).performanceMetrics = [];
      }
      (global as any).performanceMetrics.push({
        ...data,
        id: Date.now().toString(),
      });
      
      // Keep only last 100 entries to prevent memory issues
      if ((global as any).performanceMetrics.length > 100) {
        (global as any).performanceMetrics = (global as any).performanceMetrics.slice(-100);
      }
    }

    // Example: Send to external analytics service
    // await sendToAnalyticsService(data);

    return NextResponse.json({ 
      success: true, 
      message: 'Performance metrics recorded' 
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process performance metrics' },
      { status: 500 }
    );
  }
  });
}

export async function GET() {
  try {
    // Return aggregated performance data for dashboard
    const metrics = (global as any).performanceMetrics || [];
    
    if (metrics.length === 0) {
      return NextResponse.json({
        totalSessions: 0,
        averageMetrics: null,
        recentSessions: [],
      });
    }

    // Calculate averages
    const totals = metrics.reduce((acc: any, session: any) => {
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

    const averageMetrics = {
      loadTime: Math.round(totals.loadTime / metrics.length),
      firstContentfulPaint: Math.round(totals.firstContentfulPaint / metrics.length),
      largestContentfulPaint: Math.round(totals.largestContentfulPaint / metrics.length),
      cumulativeLayoutShift: (totals.cumulativeLayoutShift / metrics.length).toFixed(3),
      timeToInteractive: Math.round(totals.timeToInteractive / metrics.length),
    };

    return NextResponse.json({
      totalSessions: metrics.length,
      averageMetrics,
      recentSessions: metrics.slice(-10), // Last 10 sessions
    });

  } catch (error) {
    console.error('Performance dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
} 
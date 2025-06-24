import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { client } from '@/lib/sanity';

interface SystemMetrics {
  timestamp: string;
  performance: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    responseTime: number;
  };
  database: {
    connectionCount: number;
    queryStats?: {
      totalQueries?: number;
      avgResponseTime?: number;
    };
  };
  business: {
    totalUsers: number;
    totalMemorials: number;
    totalContactSubmissions: number;
    activeTrials: number;
    subscriptionBreakdown: Record<string, number>;
  };
  sanity: {
    connectionStatus: 'connected' | 'disconnected';
    projectInfo?: {
      projectId: string;
      dataset: string;
    };
  };
}

const startTime = Date.now();

export async function GET(request: NextRequest) {
  const requestStart = Date.now();
  
  try {
    // Gather performance metrics
    const memoryUsage = process.memoryUsage();
    const uptime = Date.now() - startTime;

    // Gather database metrics with error handling
    let totalUsers = 0;
    let totalMemorials = 0;
    let totalContactSubmissions = 0;
    let activeTrials = 0;
    let subscriptionStats: any[] = [];

    try {
      [
        totalUsers,
        totalMemorials,
        totalContactSubmissions,
        activeTrials,
        subscriptionStats
      ] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.memorial.count().catch(() => 0),
        prisma.contactSubmission.count().catch(() => 0),
        prisma.trial.count({
          where: {
            status: 'active',
            endsAt: { gt: new Date() }
          }
        }).catch(() => 0),
        prisma.user.groupBy({
          by: ['planId'],
          _count: { planId: true }
        }).catch(() => [])
      ]);
    } catch (error) {
      console.warn('Database metrics collection failed, using defaults:', error);
    }

    // Process subscription breakdown
    const subscriptionBreakdown = subscriptionStats.reduce((acc: Record<string, number>, stat) => {
      acc[stat.planId] = stat._count.planId;
      return acc;
    }, {} as Record<string, number>);

    // Check Sanity connection
    let sanityStatus: SystemMetrics['sanity'] = {
      connectionStatus: 'disconnected'
    };

    try {
      // Simple ping to Sanity
      await client.fetch('*[_type == "memorial"][0]');
      sanityStatus = {
        connectionStatus: 'connected',
        projectInfo: {
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'unknown',
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
        }
      };
    } catch (error) {
      // Sanity connection failed, status remains disconnected
    }

    const responseTime = Date.now() - requestStart;

    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      performance: {
        uptime,
        memoryUsage,
        responseTime
      },
      database: {
        connectionCount: 1, // Prisma manages connection pooling
        queryStats: {
          // In production, you could integrate with Prisma metrics
          totalQueries: 0,
          avgResponseTime: 0
        }
      },
      business: {
        totalUsers,
        totalMemorials,
        totalContactSubmissions,
        activeTrials,
        subscriptionBreakdown
      },
      sanity: sanityStatus
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Metrics collection failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to collect metrics',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Prometheus-style metrics export (for monitoring tools)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format } = body;

    if (format === 'prometheus') {
      // Basic Prometheus metrics format
      const [totalUsers, totalMemorials] = await Promise.all([
        prisma.user.count(),
        prisma.memorial.count()
      ]);

      const prometheusMetrics = `
# HELP eternal_capsule_users_total Total number of registered users
# TYPE eternal_capsule_users_total counter
eternal_capsule_users_total ${totalUsers}

# HELP eternal_capsule_memorials_total Total number of memorials created
# TYPE eternal_capsule_memorials_total counter
eternal_capsule_memorials_total ${totalMemorials}

# HELP eternal_capsule_uptime_seconds Application uptime in seconds
# TYPE eternal_capsule_uptime_seconds gauge
eternal_capsule_uptime_seconds ${Math.floor((Date.now() - startTime) / 1000)}
      `.trim();

      return new NextResponse(prometheusMetrics, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
} 
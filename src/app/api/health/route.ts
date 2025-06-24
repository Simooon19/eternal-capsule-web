import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { prisma } from '@/lib/prisma';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    sanity: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    environment: {
      status: 'configured' | 'misconfigured';
      missingVars?: string[];
    };
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET(request: NextRequest) {
  const checks: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    services: {
      database: { status: 'down' },
      sanity: { status: 'down' },
      environment: { status: 'configured' }
    },
    uptime: Date.now() - startTime
  };

  // Check Database Connection
  try {
    const dbStart = Date.now();
    // Try a simple query to test the connection
    await prisma.user.count();
    checks.services.database = {
      status: 'up',
      responseTime: Date.now() - dbStart
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    checks.services.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
    checks.status = 'degraded'; // Changed from unhealthy to degraded for better UX
  }

  // Check Sanity Connection
  try {
    const sanityStart = Date.now();
    await client.fetch('*[_type == "memorial"][0]');
    checks.services.sanity = {
      status: 'up',
      responseTime: Date.now() - sanityStart
    };
  } catch (error) {
    checks.services.sanity = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Sanity connection failed'
    };
    if (checks.status === 'healthy') {
      checks.status = 'degraded';
    }
  }

  // Check Critical Environment Variables
  const criticalEnvVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'SANITY_API_TOKEN',
    'DATABASE_URL',
    'NEXTAUTH_SECRET'
  ];

  const missingVars = criticalEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    checks.services.environment = {
      status: 'misconfigured',
      missingVars
    };
    checks.status = 'unhealthy';
  }

  // Determine overall status
  if (checks.services.database.status === 'down') {
    checks.status = 'unhealthy';
  } else if (checks.services.sanity.status === 'down') {
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 
                    checks.status === 'degraded' ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}

// HEAD request for simple up/down check
export async function HEAD(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
} 
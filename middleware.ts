import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Security configuration
const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://js.stripe.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://cdn.sanity.io https://*.stripe.com https://www.google-analytics.com",
    "connect-src 'self' https://api.sanity.io https://cdn.sanity.io https://api.stripe.com https://www.google-analytics.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "media-src 'self' https://cdn.sanity.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Other security headers
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com')
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting storage (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Simple rate limiting check
function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `${ip}`;
  
  // Clean up expired entries
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [k, data] of requestCounts.entries()) {
      if (data.resetTime <= now) {
        requestCounts.delete(k);
      }
    }
  }
  
  const current = requestCounts.get(key);
  
  if (!current || current.resetTime <= now) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

// Get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
}

// Security validation
function validateRequest(request: NextRequest): { isValid: boolean; reason?: string } {
  const url = request.nextUrl;
  
  // Block suspicious paths
  const suspiciousPaths = [
    '/wp-admin', '/wp-login', '/.env', '/admin.php', 
    '/phpmyadmin', '/config.php', '/shell.php'
  ];
  
  if (suspiciousPaths.some(path => url.pathname.includes(path))) {
    return { isValid: false, reason: 'Suspicious path detected' };
  }
  
  // Check for SQL injection patterns in query params
  const sqlPatterns = [
    /union.*select/i, /drop.*table/i, /delete.*from/i,
    /insert.*into/i, /update.*set/i, /script.*src/i
  ];
  
  const queryString = url.search;
  if (sqlPatterns.some(pattern => pattern.test(queryString))) {
    return { isValid: false, reason: 'Potential SQL injection detected' };
  }
  
  // Check user agent
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10 || userAgent.includes('sqlmap')) {
    return { isValid: false, reason: 'Suspicious user agent' };
  }
  
  return { isValid: true };
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/account',
  '/memorial/create',
  '/memorial/edit',
  '/api/user',
  '/api/memorials/bulk'
];

// Auth routes that should redirect if already authenticated
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  
  // Skip middleware for certain paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('.') && !pathname.includes('/api/') ||
    pathname.startsWith('/studio')
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute || isAuthRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && token) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  // No internationalization routing needed
  
  // Security validation
  const validation = validateRequest(request);
  if (!validation.isValid) {
    console.warn(`Security violation from ${clientIP}: ${validation.reason} - ${pathname}`);
    return new NextResponse('Access Denied', { status: 403 });
  }
  
  // Rate limiting
  const isApiRoute = pathname.startsWith('/api/');
  const rateLimit = isApiRoute ? 100 : 200; // API routes: 100/min, Pages: 200/min
  
  if (!checkRateLimit(clientIP, rateLimit)) {
    console.warn(`Rate limit exceeded for ${clientIP} on ${pathname}`);
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    });
  }
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }
  
  // Create default response
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CORS headers for API routes
  if (isApiRoute) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  // Add request tracking
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Client-IP', clientIP);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|public|icons|images).*)',
  ],
}; 
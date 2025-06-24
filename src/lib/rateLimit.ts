import { NextRequest } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  message?: string;
}

export class RateLimiter {
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      keyGenerator: options.keyGenerator || this.defaultKeyGenerator,
      message: options.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    };
  }

  private defaultKeyGenerator(request: NextRequest): string {
    // Try to get real IP, fallback to a default
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown';
    
    return `${ip}-${request.nextUrl.pathname}`;
  }

  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.options.keyGenerator(request);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // Get current count data
    let countData = requestCounts.get(key);

    // Reset if window has expired
    if (!countData || countData.resetTime <= now) {
      countData = {
        count: 0,
        resetTime: now + this.options.windowMs,
      };
    }

    // Check if limit exceeded
    if (countData.count >= this.options.maxRequests) {
      return {
        success: false,
        limit: this.options.maxRequests,
        remaining: 0,
        resetTime: countData.resetTime,
        message: this.options.message,
      };
    }

    // Increment count
    countData.count++;
    requestCounts.set(key, countData);

    // Clean up expired entries periodically
    this.cleanup();

    return {
      success: true,
      limit: this.options.maxRequests,
      remaining: this.options.maxRequests - countData.count,
      resetTime: countData.resetTime,
    };
  }

  private cleanup(): void {
    // Clean up expired entries (run occasionally to prevent memory leaks)
    if (Math.random() < 0.01) { // 1% chance to clean up
      const now = Date.now();
      for (const [key, data] of requestCounts.entries()) {
        if (data.resetTime <= now) {
          requestCounts.delete(key);
        }
      }
    }
  }

  // Method to record successful request (for skipSuccessfulRequests)
  recordSuccess(request: NextRequest): void {
    if (this.options.skipSuccessfulRequests) {
      const key = this.options.keyGenerator(request);
      const countData = requestCounts.get(key);
      if (countData && countData.count > 0) {
        countData.count--;
        requestCounts.set(key, countData);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Strict rate limiting for guestbook submissions
  guestbook: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 submissions per 15 minutes
    message: 'Too many guestbook entries. Please wait before submitting again.',
  }),

  // Analytics endpoints - moderate limiting
  analytics: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Analytics rate limit exceeded.',
  }),

  // General API endpoints
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'API rate limit exceeded.',
  }),

  // Memorial creation - very strict
  creation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 creations per hour
    message: 'Memorial creation limit reached. Please wait before creating another.',
  }),

  // Bulk memorial creation - for funeral homes
  bulkCreation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 bulk requests per hour
    message: 'Bulk creation limit reached. Please wait before creating more memorials.',
  }),
};

// Middleware helper function
export async function withRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  handler: () => Promise<Response>
): Promise<Response> {
  const result = await rateLimiter.checkLimit(request);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: result.message,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Execute the handler
  const response = await handler();

  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  // Record success if needed
  if (response.ok) {
    rateLimiter.recordSuccess(request);
  }

  return response;
}

// Hook for client-side rate limit awareness
export function useRateLimit() {
  const checkRateLimit = (response: Response) => {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetTime: parseInt(reset),
        isNearLimit: parseInt(remaining) < parseInt(limit) * 0.2, // Less than 20% remaining
      };
    }

    return null;
  };

  const handleRateLimitError = (error: any) => {
    if (error.status === 429) {
      const resetTime = error.resetTime || Date.now() + 60000; // Fallback to 1 minute
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      return {
        isRateLimited: true,
        message: error.message || 'Rate limit exceeded',
        waitTime,
        resetTime,
      };
    }

    return { isRateLimited: false };
  };

  return {
    checkRateLimit,
    handleRateLimitError,
  };
} 
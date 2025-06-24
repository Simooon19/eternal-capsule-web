// Production utilities and configuration
export const productionConfig = {
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false', // Default true
    enableCaching: process.env.ENABLE_CACHING !== 'false', // Default true
    enableProfanityFilter: process.env.ENABLE_PROFANITY_FILTER !== 'false', // Default true
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false', // Default true
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING !== 'false', // Default true
  },
  
  // Security settings
  security: {
    requireApproval: process.env.REQUIRE_APPROVAL !== 'false', // Default true
    enableCaptcha: process.env.ENABLE_CAPTCHA === 'true',
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '10485760'), // 10MB default
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedVideoTypes: ['video/mp4', 'video/webm'],
    allowedAudioTypes: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  },
  
  // Rate limiting configuration
  rateLimits: {
    guestbook: {
      windowMs: parseInt(process.env.GUESTBOOK_RATE_WINDOW || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.GUESTBOOK_RATE_MAX || '5'),
    },
    analytics: {
      windowMs: parseInt(process.env.ANALYTICS_RATE_WINDOW || '60000'), // 1 minute
      maxRequests: parseInt(process.env.ANALYTICS_RATE_MAX || '60'),
    },
    general: {
      windowMs: parseInt(process.env.GENERAL_RATE_WINDOW || '60000'), // 1 minute
      maxRequests: parseInt(process.env.GENERAL_RATE_MAX || '100'),
    },
  },
  
  // Cache configuration
  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'), // 5 minutes
    memorialTTL: parseInt(process.env.CACHE_MEMORIAL_TTL || '300'), // 5 minutes
    guestbookTTL: parseInt(process.env.CACHE_GUESTBOOK_TTL || '60'), // 1 minute
    analyticsTTL: parseInt(process.env.CACHE_ANALYTICS_TTL || '900'), // 15 minutes
    staticTTL: parseInt(process.env.CACHE_STATIC_TTL || '3600'), // 1 hour
  },
  
  // Performance monitoring
  performance: {
    enableWebVitals: process.env.ENABLE_WEB_VITALS !== 'false', // Default true
    sampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '1.0'), // 100% by default
    thresholds: {
      fcp: parseInt(process.env.THRESHOLD_FCP || '1800'), // 1.8s
      lcp: parseInt(process.env.THRESHOLD_LCP || '2500'), // 2.5s
      cls: parseFloat(process.env.THRESHOLD_CLS || '0.1'), // 0.1
      tti: parseInt(process.env.THRESHOLD_TTI || '3800'), // 3.8s
    },
  },
  
  // Database configuration
  database: {
    connectionPoolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30 seconds
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
  },
};

// Environment validation
export function validateEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  const required = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'SANITY_API_TOKEN',
  ];

  required.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });

  // Check optional but recommended variables
  const recommended = [
    'NEXT_PUBLIC_SITE_URL',
    'GOOGLE_SITE_VERIFICATION',
  ];

  recommended.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(`Missing recommended environment variable: ${envVar}`);
    }
  });

  // Validate URL format
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL is not a valid URL');
    }
  }

  // Validate numeric values
  const numericVars = [
    'MAX_UPLOAD_SIZE',
    'CACHE_DEFAULT_TTL',
    'PERFORMANCE_SAMPLE_RATE',
  ];

  numericVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value && isNaN(Number(value))) {
      errors.push(`${envVar} must be a valid number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Production logging utility
class ProductionLogger {
  private isDevelopment = productionConfig.isDevelopment;

  log(level: 'info' | 'warn' | 'error', message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    if (this.isDevelopment) {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
    } else {
      // In production, you might send to external logging service
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.log('error', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      ...meta,
    });
  }

  // Performance logging
  performance(metric: string, value: number, meta?: any): void {
    this.log('info', `Performance: ${metric}`, {
      metric,
      value,
      unit: 'ms',
      ...meta,
    });
  }

  // Analytics logging
  analytics(event: string, data: any): void {
    this.log('info', `Analytics: ${event}`, {
      event,
      data,
      category: 'analytics',
    });
  }
}

export const logger = new ProductionLogger();

// Health check utilities
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
      duration?: number;
    };
  };
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {};

  // Check database connection (Sanity)
  try {
    const dbStartTime = Date.now();
    // Simple check - could be expanded to actual Sanity query
    await fetch(`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/ping`);
    checks.database = {
      status: 'pass',
      duration: Date.now() - dbStartTime,
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      message: 'Cannot connect to Sanity',
    };
  }

  // Check environment configuration
  const envValidation = validateEnvironment();
  checks.environment = {
    status: envValidation.isValid ? 'pass' : 'fail',
    message: envValidation.errors.join(', ') || undefined,
  };

  // Check memory usage
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    checks.memory = {
      status: memoryMB < 500 ? 'pass' : 'fail', // Fail if using more than 500MB
      message: `${memoryMB}MB used`,
    };
  }

  // Determine overall status
  const failedChecks = Object.values(checks).filter(check => check.status === 'fail');
  const status: HealthCheckResult['status'] = 
    failedChecks.length === 0 ? 'healthy' :
    failedChecks.length <= 1 ? 'degraded' : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
  };
}

// Error monitoring and alerting
export class ErrorMonitor {
  private errorCounts = new Map<string, number>();
  private lastReset = Date.now();
  private readonly resetInterval = 60 * 60 * 1000; // 1 hour

  reportError(error: Error, context?: any): void {
    const errorKey = `${error.name}:${error.message}`;
    
    // Reset counts every hour
    if (Date.now() - this.lastReset > this.resetInterval) {
      this.errorCounts.clear();
      this.lastReset = Date.now();
    }

    // Increment error count
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // Log error
    logger.error('Application error', error, {
      context,
      count: currentCount + 1,
      timestamp: new Date().toISOString(),
    });

    // Alert if error occurs frequently
    if (currentCount >= 10) {
      this.alertHighErrorRate(errorKey, currentCount + 1);
    }
  }

  private alertHighErrorRate(errorKey: string, count: number): void {
    logger.error(`High error rate detected: ${errorKey}`, undefined, {
      errorKey,
      count,
      alertType: 'high_error_rate',
    });

    // In production, you might want to send to external alerting service
    // like PagerDuty, Slack, or email
  }

  getErrorSummary(): Array<{ error: string; count: number }> {
    return Array.from(this.errorCounts.entries()).map(([error, count]) => ({
      error,
      count,
    }));
  }
}

export const errorMonitor = new ErrorMonitor();

// Performance profiler
export class PerformanceProfiler {
  private timers = new Map<string, number>();

  start(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  end(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`No timer found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    
    logger.performance(operation, duration);
    return duration;
  }

  measure<T>(operation: string, fn: () => T): T {
    this.start(operation);
    try {
      const result = fn();
      return result;
    } finally {
      this.end(operation);
    }
  }

  async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.start(operation);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(operation);
    }
  }
}

export const profiler = new PerformanceProfiler();

// Production initialization
export function initializeProduction(): void {
  // Validate environment on startup
  const validation = validateEnvironment();
  if (!validation.isValid) {
    logger.error('Environment validation failed', undefined, {
      errors: validation.errors,
      warnings: validation.warnings,
    });
    
    if (productionConfig.isProduction) {
      process.exit(1); // Exit in production if critical env vars are missing
    }
  } else if (validation.warnings.length > 0) {
    logger.warn('Environment validation warnings', { warnings: validation.warnings });
  }

  // Log startup information
  logger.info('Application starting', {
    nodeEnv: process.env.NODE_ENV,
    features: productionConfig.features,
    version: process.env.npm_package_version || 'unknown',
  });

  // Set up graceful shutdown
  if (typeof process !== 'undefined') {
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully');
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      errorMonitor.reportError(error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', new Error(String(reason)), { promise });
      errorMonitor.reportError(new Error(String(reason)));
    });
  }
}

// Resource monitoring
export function getResourceUsage() {
  if (typeof process === 'undefined') {
    return null;
  }

  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    uptime: Math.round(process.uptime()),
  };
}

// Utility for feature flags
export function isFeatureEnabled(feature: keyof typeof productionConfig.features): boolean {
  return productionConfig.features[feature];
}

// Configuration summary for debugging
export function getConfigSummary() {
  return {
    environment: process.env.NODE_ENV,
    features: productionConfig.features,
    security: {
      requireApproval: productionConfig.security.requireApproval,
      enableCaptcha: productionConfig.security.enableCaptcha,
      maxUploadSize: `${Math.round(productionConfig.security.maxUploadSize / 1024 / 1024)}MB`,
    },
    rateLimits: productionConfig.rateLimits,
    cache: productionConfig.cache,
    performance: productionConfig.performance,
  };
} 
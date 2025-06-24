// Sentry error tracking configuration
// This file provides error reporting functionality with development fallbacks

import type { ReactNode, ComponentType } from 'react';

/**
 * Configuration for Sentry integration
 */
interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  attachStacktrace: boolean;
  ignoreErrors: string[];
  debug: boolean;
}

// Default configuration
const config: SentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  attachStacktrace: true,
  ignoreErrors: [
    // Browser-specific errors to ignore
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'NetworkError',
    'ChunkLoadError',
    // Next.js specific
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  debug: process.env.NODE_ENV === 'development',
};

// Development-only error reporting (no Sentry)
const devReportError = (error: Error, context?: Record<string, any>) => {
  console.error('Error reported (dev mode):', error);
  if (context) {
    console.error('Error context:', context);
  }
};

// Export a no-op version in development to prevent webpack issues
export const reportError = config.enabled 
  ? async (error: Error, context?: Record<string, any>) => {
      try {
        // Only load Sentry in production when needed
        const Sentry = await import('@sentry/nextjs');
        
        if (context) {
          Sentry.withScope((scope) => {
            Object.keys(context).forEach(key => {
              scope.setContext(key, context[key]);
            });
            Sentry.captureException(error);
          });
        } else {
          Sentry.captureException(error);
        }
        
        if (config.debug) {
          console.log('Error reported to Sentry:', error);
        }
      } catch (importError) {
        console.error('Failed to load Sentry:', importError);
        devReportError(error, context);
      }
    }
  : devReportError;

// The rest of the file remains the same but won't load Sentry modules unless needed
export const captureMessage = config.enabled
  ? async (message: string, level: 'debug' | 'info' | 'warning' | 'error' = 'info') => {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureMessage(message, level as any);
        
        if (config.debug) {
          console.log(`Message sent to Sentry (${level}):`, message);
        }
      } catch (importError) {
        console.log(`[${level.toUpperCase()}]`, message);
      }
    }
  : (message: string, level: 'debug' | 'info' | 'warning' | 'error' = 'info') => {
      console.log(`[${level.toUpperCase()}]`, message);
    };

export const setUserContext = config.enabled
  ? async (user: { id?: string; email?: string; username?: string } | null) => {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.setUser(user);
        
        if (config.debug && user) {
          console.log('User context set:', user);
        }
      } catch (importError) {
        if (config.debug && user) {
          console.log('User context (dev mode):', user);
        }
      }
    }
  : (user: { id?: string; email?: string; username?: string } | null) => {
      if (config.debug && user) {
        console.log('User context (dev mode):', user);
      }
    };

export const addBreadcrumb = config.enabled
  ? async (breadcrumb: {
      message: string;
      category?: string;
      level?: 'debug' | 'info' | 'warning' | 'error';
      data?: Record<string, any>;
      timestamp?: number;
    }) => {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.addBreadcrumb({
          ...breadcrumb,
          timestamp: breadcrumb.timestamp || Date.now() / 1000,
        });
        
        if (config.debug) {
          console.log('Breadcrumb added:', breadcrumb);
        }
      } catch (importError) {
        if (config.debug) {
          console.log('Breadcrumb (dev mode):', breadcrumb);
        }
      }
    }
  : (breadcrumb: any) => {
      if (config.debug) {
        console.log('Breadcrumb (dev mode):', breadcrumb);
      }
    };

export const capturePerformance = config.enabled
  ? async (transaction: {
      name: string;
      op: string;
      data?: Record<string, any>;
    }) => {
      try {
        const Sentry = await import('@sentry/nextjs');
        // In Sentry v9, use startSpan instead of startTransaction
        let finished = false;
        const span = await Sentry.startSpan(
          { name: transaction.name, op: transaction.op },
          () => {
            // This callback runs synchronously, we'll handle finish separately
            return null;
          }
        );
        
        if (config.debug) {
          console.log('Performance transaction started:', transaction);
        }
        
        return {
          finish: () => {
            finished = true;
            if (config.debug) {
              console.log('Performance transaction finished:', transaction.name);
            }
          },
        };
      } catch (importError) {
        if (config.debug) {
          console.log('Performance transaction (dev mode):', transaction);
        }
        return { finish: () => {} };
      }
    }
  : (transaction: any) => {
      if (config.debug) {
        console.log('Performance transaction (dev mode):', transaction);
      }
      return { finish: () => {} };
    };

export const withErrorBoundary = config.enabled
  ? async (Component: ComponentType<any>, errorBoundaryOptions?: any) => {
      try {
        const Sentry = await import('@sentry/nextjs');
        return Sentry.withErrorBoundary(Component, errorBoundaryOptions);
      } catch (importError) {
        // Return component as-is in development
        return Component;
      }
    }
  : (Component: ComponentType<any>) => Component;

export const ErrorBoundary = config.enabled
  ? ({ children, fallback }: { children: ReactNode; fallback?: string }) => {
      // Return children directly in development
      return children;
    }
  : ({ children }: { children: ReactNode }) => children;

/**
 * Initialize Sentry monitoring for specific memorial events
 */
export const initializeMemorialMonitoring = () => {
  if (!config.enabled) {
    if (config.debug) {
      console.log('Memorial monitoring disabled in development');
    }
    return;
  }

  // Memorial-specific error tracking
  addBreadcrumb({
    message: 'Memorial monitoring initialized',
    category: 'memorial',
    level: 'info',
  });
};

/**
 * Track memorial-specific errors
 */
export const reportMemorialError = (
  error: Error,
  memorialId: string,
  action: string,
  additionalContext?: Record<string, any>
) => {
  reportError(error, {
    memorial: {
      id: memorialId,
      action: action,
    },
    ...additionalContext,
  });
};

/**
 * Performance monitoring for memorial pages
 */
export const trackMemorialPerformance = async (memorialId: string) => {
  const transaction = await capturePerformance({
    name: `memorial.view`,
    op: 'navigation',
    data: {
      memorialId,
    },
  });

  return transaction;
}; 
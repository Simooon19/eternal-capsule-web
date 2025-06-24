import * as Sentry from "@sentry/nextjs";

// Server-side Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  // Disable in development to avoid noise
  enabled: process.env.NODE_ENV === 'production' && !!process.env.SENTRY_DSN,
  
  // Set sample rates for profiling
  profilesSampleRate: 1.0,
  
  beforeSend(event) {
    // Filter out events in development if needed
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
}); 
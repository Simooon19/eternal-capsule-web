import * as Sentry from "@sentry/nextjs";

// Edge runtime Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  // Disable in development to avoid noise
  enabled: process.env.NODE_ENV === 'production' && !!process.env.SENTRY_DSN,
  
  beforeSend(event) {
    // Filter out events in development if needed
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
}); 
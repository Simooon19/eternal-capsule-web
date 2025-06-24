import * as Sentry from "@sentry/nextjs";

// Client-side Sentry configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  // Enable in production only
  enabled: process.env.NODE_ENV === 'production',
  
  integrations: [
    // Only add integrations that are available
    ...(typeof window !== 'undefined' && Sentry.replayIntegration 
      ? [Sentry.replayIntegration()] 
      : []),
  ],
  
  beforeSend(event) {
    // Filter out events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event (dev mode):', event);
      return null;
    }
    return event;
  },
}); 
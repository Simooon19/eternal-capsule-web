// Google Analytics 4 integration for Eternal Capsule
import { reportError } from './sentry';

interface GAConfig {
  measurementId?: string;
  enabled: boolean;
  debugMode: boolean;
}

interface CustomEvent {
  event_name: string;
  event_parameters?: {
    [key: string]: string | number | boolean;
  };
}

interface UserProperties {
  user_id?: string;
  user_type?: 'family' | 'funeral_home' | 'visitor';
  subscription_plan?: string;
  memorial_count?: number;
}

class GoogleAnalytics {
  private config: GAConfig;
  private initialized = false;
  private queue: Array<() => void> = [];

  constructor() {
    this.config = {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      enabled: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) && 
               process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
      debugMode: process.env.NODE_ENV === 'development'
    };

    if (this.config.enabled && typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    if (!this.config.measurementId || this.initialized) return;

    try {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.config.measurementId, {
        debug_mode: this.config.debugMode,
        anonymize_ip: true, // GDPR compliance
        allow_google_signals: false, // Privacy-focused
        send_page_view: false, // We'll handle page views manually
      });

      this.initialized = true;

      // Process queued events
      this.queue.forEach(fn => fn());
      this.queue = [];

      if (this.config.debugMode) {
        console.log('Google Analytics 4 initialized:', this.config.measurementId);
      }
    } catch (error) {
      console.error('GA4 initialization failed:', error);
      reportError(new Error('GA4 initialization failed'), { error });
    }
  }

  private executeWhenReady(fn: () => void) {
    if (this.initialized) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  // Page view tracking
  trackPageView(path: string, title?: string) {
    if (!this.config.enabled) return;

    this.executeWhenReady(() => {
      try {
        window.gtag('event', 'page_view', {
          page_title: title || document.title,
          page_location: window.location.href,
          page_path: path,
        });

        if (this.config.debugMode) {
          console.log('GA4 Page View:', { path, title });
        }
      } catch (error) {
        console.warn('GA4 page view tracking failed:', error);
      }
    });
  }

  // Memorial-specific events
  trackMemorialView(memorialId: string, memorialTitle: string) {
    this.trackEvent('view_memorial', {
      memorial_id: memorialId,
      memorial_title: memorialTitle,
      event_category: 'memorial'
    });
  }

  trackMemorialCreated(memorialId: string, userType: string) {
    this.trackEvent('create_memorial', {
      memorial_id: memorialId,
      user_type: userType,
      event_category: 'memorial'
    });
  }

  trackGuestbookEntry(memorialId: string, entryLength: number) {
    this.trackEvent('guestbook_entry', {
      memorial_id: memorialId,
      entry_length: entryLength,
      event_category: 'interaction'
    });
  }

  trackMemorialShare(memorialId: string, shareMethod: string) {
    this.trackEvent('share_memorial', {
      memorial_id: memorialId,
      share_method: shareMethod,
      event_category: 'social'
    });
  }

  // NFC and QR code tracking
  trackNFCScan(memorialId: string, scanType: 'nfc' | 'qr') {
    this.trackEvent('memorial_scan', {
      memorial_id: memorialId,
      scan_type: scanType,
      event_category: 'technology'
    });
  }

  // Search tracking
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
      event_category: 'search'
    });
  }

  // User authentication events
  trackSignUp(userType: string, subscriptionPlan?: string) {
    this.trackEvent('sign_up', {
      user_type: userType,
      subscription_plan: subscriptionPlan || 'free',
      event_category: 'auth'
    });
  }

  trackLogin(userType: string) {
    this.trackEvent('login', {
      user_type: userType,
      event_category: 'auth'
    });
  }

  // Subscription events
  trackSubscription(action: 'start' | 'upgrade' | 'cancel', plan: string, value?: number) {
    const eventName = action === 'start' ? 'purchase' : 
                     action === 'upgrade' ? 'subscription_upgrade' : 
                     'subscription_cancel';

    this.trackEvent(eventName, {
      subscription_plan: plan,
      event_category: 'subscription',
      value: value || 0,
      currency: 'USD'
    });
  }

  // Performance tracking
  trackPerformance(metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  }) {
    // Track Core Web Vitals as custom metrics
    this.trackEvent('web_vitals', {
      load_time: Math.round(metrics.loadTime),
      fcp: Math.round(metrics.firstContentfulPaint),
      lcp: Math.round(metrics.largestContentfulPaint),
      cls: Math.round(metrics.cumulativeLayoutShift * 1000), // Convert to integer
      event_category: 'performance'
    });
  }

  // Error tracking
  trackError(error: string, location: string, fatal: boolean = false) {
    this.trackEvent('exception', {
      description: error,
      location: location,
      fatal: fatal,
      event_category: 'error'
    });
  }

  // Custom event tracking
  trackEvent(eventName: string, parameters?: { [key: string]: any }) {
    if (!this.config.enabled) return;

    this.executeWhenReady(() => {
      try {
        window.gtag('event', eventName, parameters);

        if (this.config.debugMode) {
          console.log('GA4 Event:', { eventName, parameters });
        }
      } catch (error) {
        console.warn('GA4 event tracking failed:', error);
      }
    });
  }

  // User properties
  setUserProperties(properties: UserProperties) {
    if (!this.config.enabled) return;

    this.executeWhenReady(() => {
      try {
        window.gtag('config', this.config.measurementId!, {
          user_id: properties.user_id,
          custom_map: {
            user_type: properties.user_type,
            subscription_plan: properties.subscription_plan,
            memorial_count: properties.memorial_count
          }
        });

        if (this.config.debugMode) {
          console.log('GA4 User Properties:', properties);
        }
      } catch (error) {
        console.warn('GA4 user properties failed:', error);
      }
    });
  }

  // Enhanced e-commerce tracking
  trackPurchase(transactionId: string, items: Array<{
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    quantity: number;
  }>, value: number) {
    if (!this.config.enabled) return;

    this.executeWhenReady(() => {
      try {
        window.gtag('event', 'purchase', {
          transaction_id: transactionId,
          value: value,
          currency: 'USD',
          items: items
        });

        if (this.config.debugMode) {
          console.log('GA4 Purchase:', { transactionId, items, value });
        }
      } catch (error) {
        console.warn('GA4 purchase tracking failed:', error);
      }
    });
  }

  // Consent management (GDPR compliance)
  updateConsent(consent: {
    analytics_storage?: 'granted' | 'denied';
    ad_storage?: 'granted' | 'denied';
  }) {
    if (!this.config.enabled) return;

    this.executeWhenReady(() => {
      try {
        window.gtag('consent', 'update', consent);

        if (this.config.debugMode) {
          console.log('GA4 Consent Updated:', consent);
        }
      } catch (error) {
        console.warn('GA4 consent update failed:', error);
      }
    });
  }

  // Check if GA is enabled and ready
  isEnabled(): boolean {
    return this.config.enabled && this.initialized;
  }
}

// Global instance
export const analytics = new GoogleAnalytics();

// Convenience functions
export const trackPageView = (path: string, title?: string) => {
  analytics.trackPageView(path, title);
};

export const trackMemorialView = (memorialId: string, title: string) => {
  analytics.trackMemorialView(memorialId, title);
};

export const trackMemorialCreated = (memorialId: string, userType: string) => {
  analytics.trackMemorialCreated(memorialId, userType);
};

export const trackGuestbookEntry = (memorialId: string, entryLength: number) => {
  analytics.trackGuestbookEntry(memorialId, entryLength);
};

export const trackNFCScan = (memorialId: string, scanType: 'nfc' | 'qr') => {
  analytics.trackNFCScan(memorialId, scanType);
};

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.trackSearch(query, resultsCount);
};

export const trackError = (error: string, location: string, fatal?: boolean) => {
  analytics.trackError(error, location, fatal);
};

export const setUserProperties = (properties: UserProperties) => {
  analytics.setUserProperties(properties);
};

// Type declarations for window.gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default analytics; 
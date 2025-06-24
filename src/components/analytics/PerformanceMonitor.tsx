'use client'

import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  memorialId?: string;
  onMetricsCollected?: (metrics: PerformanceMetrics) => void;
}

export function PerformanceMonitor({ 
  enabled = true, 
  memorialId,
  onMetricsCollected 
}: PerformanceMonitorProps) {
  const collectMetrics = useCallback(async () => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      // Wait for page to fully load
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          window.addEventListener('load', resolve, { once: true });
        });
      }

      const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const paintEntries = performance.getEntriesByType('paint');
      
      if (perfEntries.length === 0) return;

      const navigation = perfEntries[0];
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: fcp ? fcp.startTime : 0,
        largestContentfulPaint: 0, // Will be updated by observer
        cumulativeLayoutShift: 0, // Will be updated by observer
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      };

      // Observe LCP and CLS
      if ('PerformanceObserver' in window) {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            metrics.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cumulativeLayoutShift = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Disconnect observers after 10 seconds
        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          
          // Send metrics
          onMetricsCollected?.(metrics);
          
          // Optionally send to analytics endpoint
          if (memorialId) {
            sendAnalytics(memorialId, metrics);
          }
        }, 10000);
      } else {
        // Fallback for browsers without PerformanceObserver
        setTimeout(() => {
          onMetricsCollected?.(metrics);
          if (memorialId) {
            sendAnalytics(memorialId, metrics);
          }
        }, 2000);
      }
    } catch (error) {
      console.warn('Performance monitoring error:', error);
    }
  }, [enabled, memorialId, onMetricsCollected]);

  const sendAnalytics = async (memorialId: string, metrics: PerformanceMetrics) => {
    try {
      const response = await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorialId,
          metrics,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send performance metrics');
      }
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  };

  useEffect(() => {
    collectMetrics();
  }, [collectMetrics]);

  // Track user interactions
  useEffect(() => {
    if (!enabled) return;

    const trackInteraction = (event: Event) => {
      const element = event.target as HTMLElement;
      const action = event.type;
      const elementType = element.tagName.toLowerCase();
      const elementClass = element.className;
      
      // Track significant interactions
      if (['click', 'touchstart'].includes(action) && 
          ['button', 'a', 'img'].includes(elementType)) {
        
        // Debounce rapid clicks
        const now = Date.now();
        const lastTrack = (window as any)._lastInteractionTrack || 0;
        if (now - lastTrack < 100) return;
        (window as any)._lastInteractionTrack = now;

        fetch('/api/analytics/interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memorialId,
            action,
            elementType,
            elementClass,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Fail silently
        });
      }
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('touchstart', trackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('touchstart', trackInteraction);
    };
  }, [enabled, memorialId]);

  return null; // This is a utility component with no UI
}

// Hook for performance utilities
export function usePerformance() {
  const measureComponent = useCallback((componentName: string) => {
    if (typeof window === 'undefined') return () => {};

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow components in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow component detected: ${componentName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  }, []);

  const preloadResource = useCallback((href: string, type: 'image' | 'script' | 'style' = 'image') => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = type;
    
    if (type === 'image') {
      link.type = 'image/jpeg'; // Default, could be enhanced
    }
    
    document.head.appendChild(link);
  }, []);

  const prefetchPage = useCallback((href: string) => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  return {
    measureComponent,
    preloadResource,
    prefetchPage,
  };
} 
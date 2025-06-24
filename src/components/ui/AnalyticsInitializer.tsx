'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function AnalyticsInitializer() {
  useEffect(() => {
    // Analytics auto-initializes when imported (client-side only)
    // This component just ensures the analytics module is loaded
    if (typeof window !== 'undefined' && analytics.isEnabled()) {
      console.log('Analytics ready');
    }
  }, []);

  return null; // This component doesn't render anything
} 
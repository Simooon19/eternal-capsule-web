'use client';

import { useState, useEffect } from 'react';
import { isSafari, safePWADetection, safeLocalStorage } from '@/lib/safariCompat';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted first to ensure we're on client side
    setIsMounted(true);
    
    // Only initialize after mounting
    const initializePWA = () => {
      // Check if app is already installed
      const checkInstalled = () => {
        const isStandalone = safePWADetection.isStandalone();
        setIsInstalled(isStandalone);
      };

      // Check if device is iOS or Safari
      const checkIOS = () => {
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isSafariBrowser = isSafari();
        setIsIOS(isIOSDevice || isSafariBrowser);
      };

      checkInstalled();
      checkIOS();

      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        e.preventDefault();
        setDeferredPrompt(e);
        
        // Show prompt after a delay if not dismissed recently
        const lastDismissed = safeLocalStorage.getItem('pwa-install-dismissed');
        const daysSinceDismissed = lastDismissed 
          ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
          : 7;
        
        if (daysSinceDismissed > 3) {
          setTimeout(() => setShowPrompt(true), 5000);
        }
      };

      // Listen for app installed event
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowPrompt(false);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    };

    // Initialize only after a short delay to ensure complete hydration
    const timeoutId = setTimeout(initializePWA, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no deferred prompt, show manual instructions
      if (isIOS) {
        alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen".');
      } else {
        alert('To install this app, look for the install option in your browser\'s menu or address bar.');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
        safeLocalStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
      // Fallback to manual instructions
      if (isIOS) {
        alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen".');
      } else {
        alert('To install this app, look for the install option in your browser\'s menu or address bar.');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    safeLocalStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Critical: Prevent hydration issues by not rendering until fully mounted
  if (!isMounted) {
    return null;
  }

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS && !isInstalled) {
    // Only show iOS prompt if not dismissed recently
    const lastDismissed = safeLocalStorage.getItem('pwa-install-dismissed');
    const daysSinceDismissed = lastDismissed 
      ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
      : 7;
    
    if (daysSinceDismissed <= 3) {
      return null;
    }

    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white border border-granite-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-copper-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-granite-900">Install Eternal Capsule</h3>
            <p className="text-xs text-granite-600 mt-1">
              Tap the share button <span className="inline-block">📤</span> and select "Add to Home Screen"
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-granite-400 hover:text-granite-600"
            aria-label="Close install prompt"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Standard PWA Install Prompt - show even without deferred prompt for better UX
  if (!showPrompt && !deferredPrompt) {
    // For browsers that don't support install prompts, show a generic install reminder
    const lastDismissed = safeLocalStorage.getItem('pwa-install-dismissed');
    const daysSinceDismissed = lastDismissed 
      ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
      : 7;
    
    // Show generic install reminder every 7 days
    if (daysSinceDismissed <= 7) {
      return null;
    }
    
    // Show after a delay
    setTimeout(() => setShowPrompt(true), 8000);
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-granite-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-copper-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-copper-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-granite-900">Install Eternal Capsule</h3>
          <p className="text-xs text-granite-600 mt-1">
            Access your memorials offline and get a native app experience
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              className="bg-copper-600 hover:bg-copper-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="bg-granite-100 hover:bg-granite-200 text-granite-700 text-xs px-3 py-1.5 rounded font-medium transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-granite-400 hover:text-granite-600"
          aria-label="Close install prompt"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
} 
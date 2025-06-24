// PWA utilities for Eternal Capsule

export interface PWACapabilities {
  hasServiceWorker: boolean;
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  hasNotificationPermission: boolean;
  hasBackgroundSync: boolean;
}

export class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: any = null;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  // Initialize PWA features
  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupUpdateHandler();
      await this.requestNotificationPermission();
      this.trackInstallation();
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully:', this.registration);

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Setup install prompt handling
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.installPrompt = null;
      
      // Track installation
      this.trackEvent('pwa_installed');
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  // Setup update handler
  private setupUpdateHandler(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available, show update prompt
          window.dispatchEvent(new CustomEvent('pwa-update-available'));
        }
      });
    });
  }

  // Show install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted install prompt');
        this.trackEvent('pwa_install_accepted');
        return true;
      } else {
        console.log('User dismissed install prompt');
        this.trackEvent('pwa_install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  // Check PWA capabilities
  getCapabilities(): PWACapabilities {
    return {
      hasServiceWorker: 'serviceWorker' in navigator,
      isOnline: navigator.onLine,
      isInstalled: this.isInstalled(),
      canInstall: Boolean(this.installPrompt),
      hasNotificationPermission: Notification.permission === 'granted',
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    };
  }

  // Check if app is installed
  isInstalled(): boolean {
    // Check for standalone mode (iOS Safari, installed PWA)
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      return true;
    }

    // Check for display mode (Android Chrome, other browsers)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    return false;
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.trackEvent('notification_permission', { granted: permission === 'granted' });
      return permission;
    }

    return Notification.permission;
  }

  // Show notification
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        ...options,
      });
    } else {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });
    }
  }

  // Force service worker update
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      
      // If there's a waiting worker, activate it immediately
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  }

  // Clear all caches
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  // Track installation source
  private trackInstallation(): void {
    // Check if app was launched from home screen
    if (this.isInstalled()) {
      this.trackEvent('pwa_launch_from_homescreen');
    }
  }

  // Track PWA events (would integrate with your analytics)
  private trackEvent(event: string, data?: any): void {
    // This would send to your analytics system
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA Event:', event, data);
    }

    // Example: send to analytics API
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/analytics/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: `pwa_${event}`,
            data,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Fail silently for analytics
        });
      } catch {
        // Fail silently
      }
    }
  }

  // Get cache usage
  async getCacheUsage(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }

  // Register background sync
  registerBackgroundSync(tag: string): void {
    if (this.registration && 'sync' in this.registration) {
      (this.registration as any).sync.register(tag);
    }
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();

// Note: Components should call pwaManager.init() when ready, 
// not auto-initialize to avoid SSR issues 
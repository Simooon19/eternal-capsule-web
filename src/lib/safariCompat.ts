// Safari compatibility utilities
// Safari has different behavior for many web APIs

export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isPrivateBrowsing = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Test IndexedDB availability (disabled in Safari private mode)
    const db = indexedDB.open('test');
    return new Promise((resolve) => {
      db.onerror = () => resolve(true); // Private browsing
      db.onsuccess = () => {
        db.result.close();
        indexedDB.deleteDatabase('test');
        resolve(false); // Normal browsing
      };
    });
  } catch {
    return true; // Assume private browsing if test fails
  }
};

// Safe localStorage wrapper for Safari
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage access failed (Safari private mode?):', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage write failed (Safari private mode?):', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage remove failed (Safari private mode?):', error);
      return false;
    }
  }
};

// Safe IndexedDB wrapper for Safari
export const safeIndexedDB = {
  isAvailable: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (!('indexedDB' in window)) return false;
    
    // Safari private mode disables IndexedDB
    const isPrivate = await isPrivateBrowsing();
    return !isPrivate;
  },

  open: async (name: string, version?: number): Promise<IDBDatabase | null> => {
    try {
      const available = await safeIndexedDB.isAvailable();
      if (!available) return null;

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onerror = () => resolve(null); // Graceful fallback
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
          // Let caller handle upgrade
          if (request.result) {
            resolve(request.result);
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB open failed (Safari issue?):', error);
      return null;
    }
  }
};

// Safe service worker registration for Safari
export const safeServiceWorker = {
  isSupported: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator;
  },

  register: async (scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration | null> => {
    try {
      if (!safeServiceWorker.isSupported()) return null;
      
      // Safari has limited service worker support
      if (isSafari()) {
        console.log('Safari detected - service worker support may be limited');
      }

      const registration = await navigator.serviceWorker.register(scriptURL, options);
      return registration;
    } catch (error) {
      console.warn('Service worker registration failed (Safari limitation?):', error);
      return null;
    }
  }
};

// Safe media query for Safari
export const safeMatchMedia = (query: string): MediaQueryList | null => {
  try {
    if (typeof window === 'undefined') return null;
    return window.matchMedia(query);
  } catch (error) {
    console.warn('matchMedia failed (Safari issue?):', error);
    return null;
  }
};

// Safari-specific PWA detection
export const safePWADetection = {
  isStandalone: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Safari-specific standalone detection
      if ('standalone' in window.navigator && (window.navigator as any).standalone) {
        return true;
      }
      
      // Standard detection
      const media = safeMatchMedia('(display-mode: standalone)');
      return media ? media.matches : false;
    } catch (error) {
      console.warn('PWA standalone detection failed:', error);
      return false;
    }
  },

  canInstall: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Safari doesn't support beforeinstallprompt
    if (isSafari()) {
      return false; // Safari uses manual "Add to Home Screen"
    }
    
    return 'beforeinstallprompt' in window;
  }
};

// Safe notification API for Safari
export const safeNotification = {
  isSupported: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window;
  },

  requestPermission: async (): Promise<NotificationPermission> => {
    try {
      if (!safeNotification.isSupported()) return 'denied';
      
      // Safari has different notification behavior
      if (isSafari() && Notification.permission === 'default') {
        // Safari requires user gesture for notification permission
        console.log('Safari notification permission requires user interaction');
      }
      
      return await Notification.requestPermission();
    } catch (error) {
      console.warn('Notification permission request failed:', error);
      return 'denied';
    }
  }
};

// Log Safari compatibility status
export const logSafariCompatibility = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const safari = isSafari();
  const privateMode = await isPrivateBrowsing();
  const indexedDBOk = await safeIndexedDB.isAvailable();
  const serviceWorkerOk = safeServiceWorker.isSupported();
  
  console.log('🍎 Safari Compatibility Check:', {
    isSafari: safari,
    isPrivateBrowsing: privateMode,
    indexedDB: indexedDBOk,
    serviceWorker: serviceWorkerOk,
    localStorage: safeLocalStorage.getItem('test') !== undefined,
    notifications: safeNotification.isSupported(),
    pwaStandalone: safePWADetection.isStandalone()
  });
  
  if (safari && privateMode) {
    console.warn('⚠️ Safari Private Browsing detected - some features may be limited');
  }
}; 
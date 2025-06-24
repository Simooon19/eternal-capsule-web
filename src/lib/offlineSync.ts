// Offline sync utilities for PWA functionality
import { safeIndexedDB } from './safariCompat';

interface PendingEntry {
  id: string;
  data: any;
  timestamp: number;
  type: 'guestbook' | 'analytics' | 'contact';
}

class OfflineSync {
  private dbName = 'EternalCapsuleDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    try {
      // Check if IndexedDB is available (Safari private mode issue)
      const available = await safeIndexedDB.isAvailable();
      if (!available) {
        console.warn('IndexedDB not available (Safari private mode?) - offline sync disabled');
        return;
      }

      const db = await safeIndexedDB.open(this.dbName, this.dbVersion);
      if (!db) {
        console.warn('Failed to open IndexedDB - offline sync disabled');
        return;
      }

      // Handle database upgrade if needed
      if (db.version < this.dbVersion) {
        db.close();
        // Retry with upgrade handling
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, this.dbVersion);
          
          request.onerror = () => resolve(); // Graceful fallback
          request.onsuccess = () => {
            this.db = request.result;
            resolve();
          };
          
          request.onupgradeneeded = () => {
            const upgradeDb = request.result;
            
            // Create object stores for different types of offline data
            if (!upgradeDb.objectStoreNames.contains('pendingGuestbookEntries')) {
              upgradeDb.createObjectStore('pendingGuestbookEntries', { keyPath: 'id' });
            }
            
            if (!upgradeDb.objectStoreNames.contains('pendingAnalytics')) {
              upgradeDb.createObjectStore('pendingAnalytics', { keyPath: 'id' });
            }
            
            if (!upgradeDb.objectStoreNames.contains('pendingContact')) {
              upgradeDb.createObjectStore('pendingContact', { keyPath: 'id' });
            }
            
            if (!upgradeDb.objectStoreNames.contains('cachedMemorials')) {
              upgradeDb.createObjectStore('cachedMemorials', { keyPath: 'id' });
            }
          };
        });
      } else {
        this.db = db;
      }
    } catch (error) {
      console.warn('OfflineSync initialization failed (Safari compatibility issue?):', error);
    }
  }

  // Store data for later sync
  async storeForSync(type: PendingEntry['type'], data: any): Promise<string> {
    if (!this.db) await this.init();

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entry: PendingEntry = {
      id,
      data,
      timestamp: Date.now(),
      type
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([`pending${this.capitalize(type)}${type === 'analytics' ? '' : 'Entries'}`], 'readwrite');
      const store = transaction.objectStore(`pending${this.capitalize(type)}${type === 'analytics' ? '' : 'Entries'}`);
      const request = store.add(entry);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending entries for sync
  async getPendingEntries(type: PendingEntry['type']): Promise<PendingEntry[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([`pending${this.capitalize(type)}${type === 'analytics' ? '' : 'Entries'}`], 'readonly');
      const store = transaction.objectStore(`pending${this.capitalize(type)}${type === 'analytics' ? '' : 'Entries'}`);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove synced entry
  async removeSyncedEntry(type: PendingEntry['type'], id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([`pending${this.capitalize(type)}${type === 'analytics' ? '' : 'Entries'}`], 'readwrite');
      const store = transaction.objectStore(`pending${this.capitalize(type)}${type === 'analytics' ? '' : 'Entries'}`);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache memorial data for offline viewing
  async cacheMemorial(memorial: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedMemorials'], 'readwrite');
      const store = transaction.objectStore('cachedMemorials');
      const request = store.put({
        ...memorial,
        cachedAt: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached memorial
  async getCachedMemorial(id: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedMemorials'], 'readonly');
      const store = transaction.objectStore('cachedMemorials');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync all pending data when online
  async syncAll(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      await Promise.all([
        this.syncGuestbookEntries(),
        this.syncAnalytics(),
        this.syncContactForms()
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async syncGuestbookEntries(): Promise<void> {
    const entries = await this.getPendingEntries('guestbook');
    
    for (const entry of entries) {
      try {
        const response = await fetch('/api/guestbook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry.data)
        });

        if (response.ok) {
          await this.removeSyncedEntry('guestbook', entry.id);
          console.log('Synced guestbook entry:', entry.id);
        }
      } catch (error) {
        console.error('Failed to sync guestbook entry:', error);
      }
    }
  }

  private async syncAnalytics(): Promise<void> {
    const entries = await this.getPendingEntries('analytics');
    
    for (const entry of entries) {
      try {
        const response = await fetch('/api/analytics/interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry.data)
        });

        if (response.ok) {
          await this.removeSyncedEntry('analytics', entry.id);
          console.log('Synced analytics:', entry.id);
        }
      } catch (error) {
        console.error('Failed to sync analytics:', error);
      }
    }
  }

  private async syncContactForms(): Promise<void> {
    const entries = await this.getPendingEntries('contact');
    
    for (const entry of entries) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry.data)
        });

        if (response.ok) {
          await this.removeSyncedEntry('contact', entry.id);
          console.log('Synced contact form:', entry.id);
        }
      } catch (error) {
        console.error('Failed to sync contact form:', error);
      }
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Register background sync if supported
  registerBackgroundSync(tag: string): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return (registration as any).sync?.register(tag);
      }).catch((error) => {
        console.error('Background sync registration failed:', error);
      });
    }
  }

  // Clean up old cached data
  async cleanup(): Promise<void> {
    if (!this.db) await this.init();

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Clean up old cached memorials
    const transaction = this.db!.transaction(['cachedMemorials'], 'readwrite');
    const store = transaction.objectStore('cachedMemorials');
    const request = store.getAll();

    request.onsuccess = () => {
      const memorials = request.result;
      memorials.forEach((memorial) => {
        if (memorial.cachedAt < oneWeekAgo) {
          store.delete(memorial.id);
        }
      });
    };
  }
}

// Create singleton instance
export const offlineSync = new OfflineSync();

// Note: Components should call offlineSync.init() and setup event listeners when ready,
// not auto-initialize to avoid SSR issues 
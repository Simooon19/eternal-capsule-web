'use client';

import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
  pendingSyncCount: number;
}

export default function PWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    hasServiceWorker: false,
    pendingSyncCount: 0
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const isInstalled = Boolean(
        ('standalone' in window.navigator && (window.navigator as any).standalone) ||
        window.matchMedia('(display-mode: standalone)').matches
      );
      
      const isOnline = navigator.onLine;
      const hasServiceWorker = 'serviceWorker' in navigator;

      setStatus(prev => ({
        ...prev,
        isInstalled,
        isOnline,
        hasServiceWorker
      }));
    };

    const updatePendingSync = async () => {
      try {
        // This would connect to your offline sync system
        // For now, we'll simulate it
        setStatus(prev => ({ ...prev, pendingSyncCount: 0 }));
      } catch (error) {
        console.error('Failed to check pending sync:', error);
      }
    };

    updateStatus();
    updatePendingSync();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!showDetails && status.isOnline && status.pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-granite-200 rounded-lg shadow-lg p-3 max-w-xs z-40">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-granite-900">PWA Status</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-granite-400 hover:text-granite-600"
        >
          <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-granite-600">
            {status.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {showDetails && (
          <>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${status.isInstalled ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-granite-600">
                {status.isInstalled ? 'App Installed' : 'Web Version'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${status.hasServiceWorker ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-granite-600">
                {status.hasServiceWorker ? 'Offline Ready' : 'No Offline Support'}
              </span>
            </div>

            {status.pendingSyncCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-granite-600">
                  {status.pendingSyncCount} pending sync{status.pendingSyncCount > 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="pt-2 mt-2 border-t border-granite-200">
              <div className="text-granite-500">
                Features available offline:
                <ul className="mt-1 space-y-1 text-granite-400">
                  <li>• Cached memorials</li>
                  <li>• Draft entries</li>
                  <li>• Basic navigation</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
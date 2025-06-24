'use client';

import { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted first to ensure we're on client side
    setIsMounted(true);
    
    // Initialize online status only after mounting
    const initializeConnectionStatus = () => {
      // Safely check online status
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        setIsOnline(navigator.onLine);
      }

      const handleOnline = () => {
        setIsOnline(true);
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setShowStatus(true);
      };

      // Only add event listeners if window is available
      if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    };

    // Initialize only after a short delay to ensure complete hydration
    const timeoutId = setTimeout(initializeConnectionStatus, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Critical: Don't render anything until mounted to prevent hydration issues
  if (!isMounted) {
    return null;
  }

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-200' : 'bg-red-200'
          }`}
        />
        <span className="text-sm font-medium">
          {isOnline ? 'Back online' : 'No internet connection'}
        </span>
      </div>
    </div>
  );
} 
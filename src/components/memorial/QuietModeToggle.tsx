'use client';

import { useState, useEffect } from 'react';

interface QuietModeToggleProps {
  className?: string;
}

export function QuietModeToggle({ className = '' }: QuietModeToggleProps) {
  const [isQuietMode, setIsQuietMode] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    const savedQuietMode = localStorage.getItem('memorial-quiet-mode');
    if (savedQuietMode === 'true') {
      setIsQuietMode(true);
      document.documentElement.classList.add('quiet-mode');
    }
  }, []);

  const toggleQuietMode = () => {
    const newQuietMode = !isQuietMode;
    setIsQuietMode(newQuietMode);
    
    // Save to localStorage
    localStorage.setItem('memorial-quiet-mode', newQuietMode.toString());
    
    // Apply to document
    if (newQuietMode) {
      document.documentElement.classList.add('quiet-mode');
    } else {
      document.documentElement.classList.remove('quiet-mode');
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm text-granite-700 dark:text-pearl-300 memorial-text">
        Tyst läge
      </span>
      <button
        onClick={toggleQuietMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-serenity-500 focus:ring-offset-2 ${
          isQuietMode 
            ? 'bg-serenity-600' 
            : 'bg-pearl-300 dark:bg-granite-600'
        }`}
        role="switch"
        aria-checked={isQuietMode}
        aria-label="Aktivera tyst läge för lugnare upplevelse"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            isQuietMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="flex flex-col">
        <span className="text-xs text-granite-600 dark:text-pearl-400">
          {isQuietMode ? 'På' : 'Av'}
        </span>
      </div>
    </div>
  );
}

export default QuietModeToggle;
import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'image' | 'avatar' | 'card' | 'gallery';
  className?: string;
  count?: number;
}

export default function SkeletonLoader({ 
  variant = 'text', 
  className = '', 
  count = 1 
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-600 rounded';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'image':
        return 'h-48 w-full';
      case 'avatar':
        return 'h-12 w-12 rounded-full';
      case 'card':
        return 'h-64 w-full';
      case 'gallery':
        return 'aspect-square w-full';
      default:
        return 'h-4 w-full';
    }
  };

  const variantClasses = getVariantClasses();

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="p-6 space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'gallery') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses} ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses} ${className}`}
        />
      ))}
    </div>
  );
}

// Specialized skeleton components
export function MemorialCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <SkeletonLoader variant="image" className="h-48" />
      <div className="p-6 space-y-3">
        <SkeletonLoader variant="text" className="h-6 w-3/4" />
        <SkeletonLoader variant="text" className="h-4 w-1/2" />
        <SkeletonLoader variant="text" className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function GuestbookEntrySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" className="h-4 w-1/4" />
          <SkeletonLoader variant="text" className="h-3 w-1/6" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="h-4 w-full" />
        <SkeletonLoader variant="text" className="h-4 w-3/4" />
        <SkeletonLoader variant="text" className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="relative flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start space-x-4">
              <SkeletonLoader variant="image" className="w-16 h-16" />
              <div className="flex-1 space-y-2">
                <SkeletonLoader variant="text" className="h-3 w-1/4" />
                <SkeletonLoader variant="text" className="h-5 w-1/2" />
                <SkeletonLoader variant="text" className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
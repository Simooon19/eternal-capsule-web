import React from 'react';
import { cn } from '@/lib/utils';

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
    <div className="group cursor-pointer">
      <SkeletonLoader variant="image" className="relative overflow-hidden rounded-lg aspect-[4/3] mb-4" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="h-6 w-3/4" />
        <SkeletonLoader variant="text" className="h-4 w-1/2" />
        <SkeletonLoader variant="text" className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function MemorialContentSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl md:max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <SkeletonLoader variant="text" className="h-8 w-3/4 mx-auto" />
          <SkeletonLoader variant="text" className="h-4 w-1/2 mx-auto" />
          <SkeletonLoader variant="text" className="h-4 w-1/3 mx-auto" />
        </div>
        
        {/* Gallery */}
        <SkeletonLoader variant="gallery" count={6} />
        
        {/* Content blocks */}
        <div className="space-y-4">
          <SkeletonLoader variant="text" className="h-6 w-1/4" />
          <SkeletonLoader variant="text" count={3} />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <SkeletonLoader variant="avatar" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" className="h-4 w-3/4" />
            <SkeletonLoader variant="text" className="h-3 w-1/2" />
          </div>
          <SkeletonLoader variant="text" className="h-8 w-20" />
        </div>
      ))}
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

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-granite-200 dark:bg-granite-700",
        className
      )}
      {...props}
    />
  );
}

export function NavigationSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-granite-900 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Skeleton className="h-6 w-32 bg-granite-700" />
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-20 bg-granite-700" />
          <Skeleton className="h-4 w-24 bg-granite-700" />
          <Skeleton className="h-4 w-16 bg-granite-700" />
        </div>
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <section className="bg-granite-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </div>
    </section>
  );
}
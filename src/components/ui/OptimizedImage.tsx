'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  quality = 85,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800",
        className
      )}>
        <div className="text-center p-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-granite-200 animate-pulse",
          fill ? "rounded" : ""
        )}>
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-sm text-granite-500">Loading...</span>
          </div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Generate a simple blur data URL for placeholder
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

// Hook for image optimization
export function useImageOptimization() {
  const getOptimalSizes = (breakpoints: Record<string, number>) => {
    return Object.entries(breakpoints)
      .map(([bp, width]) => `(max-width: ${bp}px) ${width}px`)
      .join(', ');
  };

  const generateResponsiveSizes = (maxWidth: number) => {
    return `(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, ${maxWidth}px`;
  };

  return {
    getOptimalSizes,
    generateResponsiveSizes,
  };
} 
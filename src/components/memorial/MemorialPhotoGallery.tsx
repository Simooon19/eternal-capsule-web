'use client'

import React, { useState } from 'react';
import { urlForImage } from '@/lib/sanity';
import { Image as ImageType } from '@/types/memorial';
import Lightbox from '@/components/ui/Lightbox';
import { OptimizedImage, useImageOptimization } from '@/components/ui/OptimizedImage';
import { useResponsive, imageSizes, animations } from '@/lib/responsive';

interface MemorialPhotoGalleryProps {
  images: ImageType[];
  title?: string;
  className?: string;
}

export function MemorialPhotoGallery({ 
  images, 
  title = "Photo Gallery",
  className = "" 
}: MemorialPhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');
  const { getGridClass } = useResponsive();

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (image: ImageType, index: number) => {
    const imageUrl = urlForImage(image).url() || '/images/memorial-placeholder.svg';
    const imageAlt = image.alt || `Photo ${index + 1}`;
    
    setSelectedImage(imageUrl);
    setSelectedImageAlt(imageAlt);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedImageAlt('');
  };

  return (
    <section className={`mb-12 ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      
      <div className={`grid gap-6 ${getGridClass('gallery')}`}>
        {images.map((image, index) => (
          <div 
            key={image._key || index} 
            className={`aspect-square relative rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer group ${animations.fadeIn}`}
            onClick={() => openLightbox(image, index)}
          >
            <OptimizedImage
              src={urlForImage(image).url() || '/images/memorial-placeholder.svg'}
              alt={image.alt || `Photo ${index + 1}`}
              fill
              sizes={imageSizes.gallery}
              className={`object-cover ${animations.scaleHover}`}
              priority={index < 3} // Prioritize first 3 images
            />
            
            {/* Overlay with zoom icon */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image counter */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {images.length} {images.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      <Lightbox
        isOpen={!!selectedImage}
        imageSrc={selectedImage || ''}
        imageAlt={selectedImageAlt}
        onClose={closeLightbox}
      />
    </section>
  );
} 
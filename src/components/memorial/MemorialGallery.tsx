'use client';

import { useState } from 'react';
import { Image } from '@/types/memorial';
import Lightbox from '@/components/ui/Lightbox';

interface MemorialGalleryProps {
  images: Image[];
}

export function MemorialGallery({ images }: MemorialGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  // Filter out invalid images
  const validImages = images.filter(image => image.url && image.width > 0 && image.height > 0);

  if (validImages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validImages.map((image, index) => (
          <div
            key={image._key}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-pearl-200 dark:border-granite-700 hover:border-serenity-300 dark:hover:border-serenity-600 transition-all duration-500 shadow-sm hover:shadow-md"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.alt || `Minnesbild ${index + 1}`}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-110"
            />
            {/* Gentle overlay for reverence */}
            <div className="absolute inset-0 bg-gradient-to-t from-granite-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Optional: View icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-pearl-50/90 dark:bg-granite-800/90 backdrop-blur-sm rounded-full p-3">
                <svg className="h-6 w-6 text-serenity-600 dark:text-serenity-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Lightbox
        isOpen={!!selectedImage}
        imageSrc={selectedImage?.url || ''}
        imageAlt={selectedImage?.alt || 'Minnesbild'}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
} 
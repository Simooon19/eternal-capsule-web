'use client';

import { useState } from 'react';
import { Image } from '@/types/memorial';

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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validImages.map((image) => (
          <div
            key={image._key}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.alt || 'Memorial image'}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt || 'Memorial image'}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
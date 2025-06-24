'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from '@/components/ui/Lightbox';

interface ImageGalleryProps {
  images: {
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
  }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => {
              setSelectedImage(image.url);
              setSelectedImageAlt(image.alt);
            }}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg" />
          </div>
        ))}
      </div>

      <Lightbox
        isOpen={!!selectedImage}
        imageSrc={selectedImage || ''}
        imageAlt={selectedImageAlt}
        onClose={() => {
          setSelectedImage(null);
          setSelectedImageAlt('');
        }}
      />
    </div>
  );
} 
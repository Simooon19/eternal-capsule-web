'use client';

import Link from 'next/link';
import { urlForImage } from '@/lib/sanity';
import { Memorial } from '@/types/memorial';

interface MemorialCardProps {
  memorial: Memorial;
}

export default function MemorialCard({ memorial }: MemorialCardProps) {
  if (!memorial || !memorial.slug) {
    return null;
  }

  return (
    <Link href={`/memorial/${memorial.slug.current}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative h-48">
          {memorial.gallery && memorial.gallery[0] ? (
            <img
              src={urlForImage(memorial.gallery[0]).width(400).height(300).url()}
              alt={memorial.gallery[0].alt || memorial.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No image available</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{memorial.name}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            {new Date(memorial.born).getFullYear()} - {new Date(memorial.died).getFullYear()}
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
            {memorial.description}
          </p>
        </div>
      </div>
    </Link>
  );
} 
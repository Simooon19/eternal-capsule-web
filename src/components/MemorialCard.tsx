'use client';

import React from 'react';
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
    <Link href={`/memorial/${memorial.slug.current}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3]">
          {memorial.gallery && memorial.gallery[0] ? (
            <img
              src={urlForImage(memorial.gallery[0]).width(400).height(300).url()}
              alt={memorial.gallery[0].alt || memorial.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-400">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {memorial.title}
          </h3>
          {memorial.subtitle && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {memorial.subtitle}
            </p>
          )}
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            {memorial.bornAt?.location && memorial.diedAt?.location && (
              <span>{memorial.bornAt.location} - {memorial.diedAt.location}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 
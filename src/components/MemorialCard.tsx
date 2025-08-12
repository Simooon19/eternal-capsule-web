'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlForImage } from '@/lib/sanity';
import { Memorial } from '@/types/memorial';

interface MemorialCardProps {
  memorial: Memorial;
}

export default function MemorialCard({ memorial }: MemorialCardProps) {
  if (!memorial || !memorial.slug) {
    return null;
  }

  // Helper function to format dates elegantly
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to get years from dates
  const getYear = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  // Get the main image with better fallback handling
  const mainImage = memorial.coverImage || memorial.gallery?.[0];
  
  // Get location information - prioritize death location for obituary feel
  const primaryLocation = memorial.diedAt?.location || memorial.bornAt?.location || '';
  
  // Format name properly
  const displayName = memorial.title || memorial.name || 'Unknown';

  // Get birth and death dates with fallback to personalInfo
  const birthDate = memorial.born || memorial.personalInfo?.dateOfBirth;
  const deathDate = memorial.died || memorial.personalInfo?.dateOfDeath;

  return (
    <Link 
      href={`/memorial/${memorial.slug.current}`}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-500 focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="memorial-card-gentle group cursor-pointer bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm hover:shadow-lg overflow-hidden border border-pearl-200 dark:border-granite-700 hover:border-sage-300 dark:hover:border-sage-600 transition-all duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-pearl-100 dark:bg-granite-700 aspect-[4/3]">
          {mainImage ? (
            <Image
              src={urlForImage(mainImage).url()}
              alt={`Minnesbild av ${displayName}`}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              className="memorial-image w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {/* Placeholder image */}
              <Image
                src="/images/memorial-photo-1.svg"
                alt={`Standardbild för ${displayName}`}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="w-full h-full object-cover opacity-90"
                priority={false}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Container */}
        <div className="memorial-section p-6 space-y-4">
          {/* Name - Most Prominent */}
          <h3 className="text-xl font-semibold text-granite-900 dark:text-pearl-100 group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors duration-300 line-clamp-2 leading-tight">
            {displayName}
          </h3>

          {/* Life Span - Enhanced with better contrast */}
          <div className="space-y-3">
            {(birthDate || deathDate) && (
              <div className="memorial-dates text-lg text-copper-600 dark:text-copper-400 font-medium">
                {birthDate && <span>{getYear(birthDate)}</span>}
                <span className="mx-2 text-sage-500">–</span>
                {deathDate && <span>{getYear(deathDate)}</span>}
              </div>
            )}
            
            {/* Full Dates - More detailed with improved spacing */}
            {(birthDate || deathDate) && (
              <div className="memorial-content text-sm text-granite-700 dark:text-pearl-300">
                {birthDate && (
                  <div className="mb-1">
                    <span className="font-medium text-sage-700 dark:text-sage-300">Född:</span> {formatDate(birthDate)}
                  </div>
                )}
                {deathDate && (
                  <div>
                    <span className="font-medium text-sage-700 dark:text-sage-300">Avled:</span> {formatDate(deathDate)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location - Enhanced with warmer colors */}
          {primaryLocation && (
            <div className="flex items-center space-x-2 text-sm text-granite-600 dark:text-pearl-400 memorial-text">
              <svg className="h-4 w-4 text-sage-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{primaryLocation}</span>
            </div>
          )}

          {/* Subtitle/Description with gentle styling */}
          {memorial.subtitle && (
            <p className="memorial-description text-sm text-granite-600 dark:text-pearl-400 line-clamp-2">
              "{memorial.subtitle}"
            </p>
          )}

          {/* Memorial Indicators - Enhanced */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-pearl-200 dark:border-granite-700">
            <div className="flex items-center space-x-3">
              {memorial.gallery && memorial.gallery.length > 0 && (
                <span className="inline-flex items-center text-xs text-serenity-600 dark:text-serenity-400 bg-serenity-50 dark:bg-serenity-900 px-2 py-1 rounded-full">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {memorial.gallery.length}
                </span>
              )}
              {memorial.storyBlocks && memorial.storyBlocks.length > 0 && (
                <span className="inline-flex items-center text-xs text-lavender-600 dark:text-lavender-400 bg-lavender-50 dark:bg-lavender-900 px-2 py-1 rounded-full">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Berättelse
                </span>
              )}
            </div>
            
            {/* View Memorial Link with comforting colors */}
            <span className="text-xs text-sage-600 dark:text-sage-400 group-hover:text-sage-700 dark:group-hover:text-sage-300 font-medium transition-colors duration-300 flex items-center">
              Se Minneslund 
              <svg className="h-3 w-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 
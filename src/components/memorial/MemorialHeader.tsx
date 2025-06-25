import React from 'react';
import { Memorial } from '@/types/memorial';

interface MemorialHeaderProps {
  memorial: Memorial;
  funeralHomeLogo?: string;
  funeralHomeName?: string;
}

export function MemorialHeader({ memorial, funeralHomeLogo, funeralHomeName }: MemorialHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="text-center mb-12 px-4">
      {/* Simple Funeral Home Branding with improved contrast */}
      {funeralHomeLogo && funeralHomeName && (
        <div className="mb-8 pb-6 border-b border-pearl-200 dark:border-pearl-700">
          <div className="flex items-center justify-center space-x-3">
            <img 
              src={funeralHomeLogo} 
              alt={funeralHomeName}
              className="h-8 w-auto"
            />
            <span className="text-sm text-granite-600 dark:text-pearl-400 memorial-text">
              Skapad av {funeralHomeName}
            </span>
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight drop-shadow-lg">
          {memorial.title || memorial.name}
        </h1>
        
        {(memorial.subtitle || memorial.description) && (
          <div className="memorial-description mb-4 text-white/90 max-w-3xl mx-auto drop-shadow-md">
            {memorial.subtitle ?? memorial.description}
          </div>
        )}
        
        {/* Places with better spacing and contrast */}
        {(memorial.bornAt?.location || memorial.diedAt?.location) && (
          <p className="text-lg mb-3 text-white/85 memorial-text drop-shadow-md">
            {memorial.bornAt?.location && <span>{memorial.bornAt.location}</span>}
            {memorial.bornAt?.location && memorial.diedAt?.location && <span className="mx-2 text-white/70">•</span>}
            {memorial.diedAt?.location && <span>{memorial.diedAt.location}</span>}
          </p>
        )}
        
        {/* Resting Place Information */}
        {memorial.personalInfo?.restingPlace && (
          <div className="text-base mb-3 text-white/85 memorial-text drop-shadow-md">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Vila i {memorial.personalInfo.restingPlace.cemetery}</span>
              {memorial.personalInfo.restingPlace.section && (
                <span className="text-sm text-white/60">
                  • Sektion {memorial.personalInfo.restingPlace.section}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Dates with enhanced formatting and better contrast */}
        {(memorial.born || memorial.died) && (
          <div className="memorial-dates mt-4 text-white bg-black/30 backdrop-blur-sm rounded-lg py-3 px-6 inline-block border border-white/20">
            {memorial.born && <span>{formatDate(memorial.born)}</span>}
            {memorial.born && memorial.died && <span className="mx-3 text-white/70">–</span>}
            {memorial.died && <span>{formatDate(memorial.died)}</span>}
          </div>
        )}
      </div>
    </div>
  );
} 
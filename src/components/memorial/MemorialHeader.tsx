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
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-granite-900 dark:text-pearl-50 leading-tight">
          {memorial.title || memorial.name}
        </h1>
        
        {(memorial.subtitle || memorial.description) && (
          <div className="memorial-description mb-4 text-granite-700 dark:text-pearl-200 max-w-3xl mx-auto">
            {memorial.subtitle ?? memorial.description}
          </div>
        )}
        
        {/* Places with better spacing and contrast */}
        {(memorial.bornAt?.location || memorial.diedAt?.location) && (
          <p className="text-lg mb-3 text-granite-600 dark:text-pearl-300 memorial-text">
            {memorial.bornAt?.location && <span>{memorial.bornAt.location}</span>}
            {memorial.bornAt?.location && memorial.diedAt?.location && <span className="mx-2 text-serenity-400">•</span>}
            {memorial.diedAt?.location && <span>{memorial.diedAt.location}</span>}
          </p>
        )}
        
        {/* Dates with enhanced formatting */}
        {(memorial.born || memorial.died) && (
          <div className="memorial-dates mt-4 text-granite-800 dark:text-pearl-200 bg-pearl-50 dark:bg-granite-800 rounded-lg py-3 px-6 inline-block">
            {memorial.born && <span>{formatDate(memorial.born)}</span>}
            {memorial.born && memorial.died && <span className="mx-3 text-serenity-500">–</span>}
            {memorial.died && <span>{formatDate(memorial.died)}</span>}
          </div>
        )}
      </div>
    </div>
  );
} 
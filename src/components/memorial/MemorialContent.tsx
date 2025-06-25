'use client'

import React, { Suspense } from 'react';
import { Memorial } from '@/types/memorial';
import { StoryRenderer } from '@/components/memorial/StoryRenderer';
import { MemorialHeader } from '@/components/memorial/MemorialHeader';
import { MemorialPhotoGallery } from '@/components/memorial/MemorialPhotoGallery';
import { MediaGallery } from '@/components/memorial/MediaGallery';
import { MemorialTags } from '@/components/memorial/MemorialTags';
import { MemorialGuestbook } from '@/components/memorial/MemorialGuestbook';
import MemorialStats from '@/components/memorial/MemorialStats';
import { ShareMemorial } from '@/components/memorial/ShareMemorial';
import { PerformanceMonitor } from '@/components/analytics/PerformanceMonitor';
import dynamic from 'next/dynamic';
import MemorialTimeline from '@/components/memorial/MemorialTimeline';
import TimelineComponent from '@/components/memorial/TimelineComponent';
import Link from 'next/link';
import QuietModeToggle from '@/components/memorial/QuietModeToggle';

// Dynamically import the LocationMap component to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/memorial/LocationMap').then(mod => mod.LocationMap), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />,
});

interface MemorialContentProps {
  memorial: Memorial;
}

const MemorialContent = ({ memorial }: MemorialContentProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pearl-100 to-pearl-200">
      {/* Performance Monitoring */}
      <PerformanceMonitor 
        enabled={true}
        memorialId={memorial._id}
        onMetricsCollected={(metrics) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Performance Metrics:', metrics);
          }
        }}
      />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-granite-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-granite-600">
            <Link href="/" className="hover:text-copper-600 transition-colors">
              Hem
            </Link>
            <span className="mx-2">›</span>
            <Link href="/memorial/explore" className="hover:text-copper-600 transition-colors">
              Minneslundar
            </Link>
            <span className="mx-2">›</span>
            <span className="text-granite-900 font-medium">
              {memorial.title || memorial.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Enhanced Header Section with Hero Image Background */}
          <div className="relative mb-12 rounded-2xl overflow-hidden bg-white shadow-lg">
            {/* Hero Background */}
            <div className="absolute inset-0">
              {memorial.coverImage ? (
                <img
                  src={memorial.coverImage.url}
                  alt={memorial.coverImage.alt || 'Memorial background'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-granite-100 via-granite-50 to-copper-50" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
            </div>
            
            {/* Header Content */}
            <div className="relative z-10 p-8 md:p-12 text-center">
              <MemorialHeader memorial={memorial} />
              
            </div>
          </div>

          {/* Enhanced Full Width Content */}
          <div className="space-y-8">
            {/* Tags Section - Moved to top and full width */}
            {memorial.tags && memorial.tags.length > 0 && (
              <section className="bg-pearl-25 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-150 dark:border-granite-700">
                <MemorialTags tags={memorial.tags} />
              </section>
            )}

            {/* Story Section - Full width */}
            {memorial.storyBlocks && memorial.storyBlocks.length > 0 && (
              <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-granite-900 dark:text-pearl-100">
                  <svg className="w-6 h-6 mr-2 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Livsberättelse
                </h2>
                <div className="prose max-w-none dark:prose-invert prose-granite dark:prose-pearl">
                  <StoryRenderer blocks={memorial.storyBlocks} />
                </div>
              </section>
            )}

            {/* Photo Gallery - Full width */}
            {memorial.gallery && memorial.gallery.length > 0 && (
              <Suspense fallback={
                <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="flex items-center mb-6">
                    <div className="w-6 h-6 mr-2 bg-pearl-200 dark:bg-granite-600 rounded"></div>
                    <div className="h-7 bg-pearl-200 dark:bg-granite-600 rounded w-32"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square bg-pearl-200 dark:bg-granite-600 rounded-lg"></div>
                    ))}
                  </div>
                </section>
              }>
                <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center text-granite-900 dark:text-pearl-100">
                    <svg className="w-6 h-6 mr-2 text-serenity-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Fotominnen
                  </h2>
                  <MemorialPhotoGallery 
                    images={memorial.gallery?.map((item, index) => ({
                      _key: `gallery-${index}`,
                      url: item.url,
                      alt: item.alt || '',
                      width: 800,
                      height: 600
                    })) || []} 
                  />
                </section>
              </Suspense>
            )}

            {/* Timeline Section - Full width */}
            {(memorial.timeline && memorial.timeline.length > 0) ? (
              <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-granite-900 dark:text-pearl-100">
                  <svg className="w-6 h-6 mr-2 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Livsresa
                </h2>
                <TimelineComponent events={memorial.timeline} layout="vertical" />
              </section>
            ) : (
              memorial.born && memorial.died && (
                <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700">
                  <MemorialTimeline memorial={memorial} />
                </section>
              )
            )}

            {/* Media Gallery - Videos and Audio - Full width */}
            <MediaGallery 
              videos={memorial.videos} 
              audioMemories={memorial.audioMemories} 
            />

            {/* Life Journey Map - Full width */}
            {(memorial.bornAt?.coordinates || memorial.diedAt?.coordinates || memorial.personalInfo?.restingPlace?.coordinates) && (
              <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700 relative z-0">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-granite-900 dark:text-pearl-100">
                  <svg className="w-6 h-6 mr-2 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Livsresans Karta
                </h2>
                <div className="relative z-0 overflow-hidden rounded-lg">
                  <Suspense fallback={<div className="h-[400px] w-full bg-granite-100 rounded-lg animate-pulse" />}>
                    <LocationMap 
                      bornAt={{
                        location: memorial.bornAt?.location || '',
                        coordinates: memorial.bornAt?.coordinates
                      }} 
                      diedAt={{
                        location: memorial.diedAt?.location || '',
                        coordinates: memorial.diedAt?.coordinates
                      }}
                      restingPlace={{
                        location: memorial.personalInfo?.restingPlace?.cemetery || '',
                        coordinates: memorial.personalInfo?.restingPlace?.coordinates
                      }}
                    />
                  </Suspense>
                  <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    {memorial.bornAt?.location && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span>Född i {memorial.bornAt.location}</span>
                      </div>
                    )}
                    {memorial.diedAt?.location && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                        <span>Avled i {memorial.diedAt.location}</span>
                      </div>
                    )}
                    {memorial.personalInfo?.restingPlace?.coordinates && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        <span>Vila i {memorial.personalInfo.restingPlace.cemetery}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Guestbook - Full Width */}
          <div className="mt-12">
            <div className="bg-pearl-25 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-150 dark:border-granite-700">
              <MemorialGuestbook 
                memorialId={memorial._id} 
                initialEntries={memorial.guestbook || []} 
              />
            </div>
          </div>

          {/* Memorial Stats & Share - Moved to Bottom */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Memorial Statistics */}
            <div className="bg-pearl-25 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-150 dark:border-granite-700">
              <h3 className="text-lg font-semibold mb-4 text-granite-900 dark:text-pearl-100">Minneslundsstatistik</h3>
              <MemorialStats memorial={memorial} />
            </div>
            
            {/* Share Memorial */}
            <div className="bg-pearl-25 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-150 dark:border-granite-700">
              <h3 className="text-lg font-semibold mb-4 text-granite-900 dark:text-pearl-100">Dela Minneslund</h3>
              <ShareMemorial memorial={memorial} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialContent; 
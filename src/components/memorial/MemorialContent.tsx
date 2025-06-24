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
    <div className="min-h-screen bg-gradient-to-b from-granite-25 to-granite-50">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
            </div>
            
            {/* Header Content */}
            <div className="relative z-10 p-8 md:p-12 text-center">
              <MemorialHeader memorial={memorial} />
              
              {/* Memorial Actions */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <ShareMemorial memorial={memorial} />
                <button className="inline-flex items-center px-4 py-2 bg-white/90 text-granite-900 rounded-lg hover:bg-white transition-colors backdrop-blur-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Tänd ett Ljus
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery - Enhanced with gentle loading */}
              {memorial.gallery && memorial.gallery.length > 0 && (
                <Suspense fallback={
                  <section className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex items-center mb-6">
                      <div className="w-6 h-6 mr-2 bg-pearl-200 dark:bg-granite-600 rounded"></div>
                      <div className="h-7 bg-pearl-200 dark:bg-granite-600 rounded w-32"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
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

              {/* Timeline Section */}
              {(memorial.timeline && memorial.timeline.length > 0) ? (
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Livsresa
                  </h2>
                  <TimelineComponent events={memorial.timeline} layout="vertical" />
                </section>
              ) : (
                memorial.born && memorial.died && (
                  <section className="bg-white rounded-xl shadow-sm p-6">
                    <MemorialTimeline memorial={memorial} />
                  </section>
                )
              )}

              {/* Story Section */}
              {memorial.storyBlocks && memorial.storyBlocks.length > 0 && (
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Livsberättelse
                  </h2>
                  <div className="prose max-w-none dark:prose-invert prose-granite">
                    <StoryRenderer blocks={memorial.storyBlocks} />
                  </div>
                </section>
              )}

              {/* Media Gallery - Videos and Audio */}
              <MediaGallery 
                videos={memorial.videos} 
                audioMemories={memorial.audioMemories} 
              />

              {/* Life Journey Map */}
              {(memorial.bornAt?.location || memorial.diedAt?.location) && (
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-copper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Livsresans Karta
                  </h2>
                  <div className="relative">
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
                      />
                    </Suspense>
                    <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      {memorial.bornAt?.location && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-copper-500 mr-2"></span>
                          <span>Född i {memorial.bornAt.location}</span>
                        </div>
                      )}
                      {memorial.diedAt?.location && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-copper-500 mr-2"></span>
                          <span>Avled i {memorial.diedAt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Memorial Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <MemorialStats memorial={memorial} />
              </div>

              {/* Tags */}
              {memorial.tags && memorial.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <MemorialTags tags={memorial.tags} />
                </div>
              )}

              {/* Accessibility Options */}
              <div className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700">
                <h3 className="text-lg font-semibold mb-4 text-granite-900 dark:text-pearl-100">Tillgänglighet</h3>
                <div className="space-y-4">
                  <QuietModeToggle />
                  <p className="text-xs text-granite-600 dark:text-pearl-400">
                    Tyst läge minskar animationer för en lugnare upplevelse
                  </p>
                </div>
              </div>

              {/* Memorial Actions */}
              <div className="bg-pearl-50 dark:bg-granite-800 rounded-xl shadow-sm p-6 border border-pearl-200 dark:border-granite-700">
                <h3 className="text-lg font-semibold mb-4 text-granite-900 dark:text-pearl-100">Minneslundsåtgärder</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-serenity-50 text-serenity-700 rounded-lg hover:bg-serenity-100 dark:bg-serenity-900 dark:text-serenity-300 dark:hover:bg-serenity-800 transition-all duration-300">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Lägg till Foto
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-pearl-100 text-granite-700 rounded-lg hover:bg-pearl-200 dark:bg-granite-700 dark:text-pearl-300 dark:hover:bg-granite-600 transition-all duration-300">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Dela Minneslund
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-pearl-100 text-granite-700 rounded-lg hover:bg-pearl-200 dark:bg-granite-700 dark:text-pearl-300 dark:hover:bg-granite-600 transition-all duration-300">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Ladda ner Minnen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Guestbook - Full Width */}
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <MemorialGuestbook 
                memorialId={memorial._id} 
                initialEntries={memorial.guestbook || []} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialContent; 
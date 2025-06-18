'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { urlForImage, client } from '@/lib/sanity';
import { Memorial, GuestbookEntry } from '@/types/memorial';
import TimelineComponent from '@/components/memorial/TimelineComponent';
import { StoryRenderer } from '@/components/memorial/StoryRenderer';
import AddGuestbookEntry from '@/components/memorial/AddGuestbookEntry';
import VideoPlayer from '@/components/memorial/VideoPlayer';
import AudioPlayer from '@/components/memorial/AudioPlayer';
import NFCIntegration from '@/components/memorial/NFCIntegration';
import GuestbookReactions from '@/components/memorial/GuestbookReactions';
import MemorialStats from '@/components/memorial/MemorialStats';
import { ShareMemorial } from '@/components/memorial/ShareMemorial';
import dynamic from 'next/dynamic';

// Dynamically import the LocationMap component to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/memorial/LocationMap').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />,
});

interface MemorialContentProps {
  memorial: Memorial;
}

export default function MemorialContent({ memorial }: MemorialContentProps) {
  const [guestbookEntries, setGuestbookEntries] = useState(memorial.guestbook || [])

  useEffect(() => {
    // Debug location data
    console.log('Memorial data:', {
      title: memorial.title,
      bornAt: memorial.bornAt,
      diedAt: memorial.diedAt
    });
  }, [memorial]);

  const handleEntryAdded = async () => {
    const updatedMemorial = await client.fetch(
      `*[_type == "memorial" && _id == $id][0]{
        guestbook[] | order(createdAt desc) {
          _id,
          author,
          message,
          createdAt,
          status,
          reactions
        }
      }`,
      { id: memorial._id }
    )
    setGuestbookEntries(updatedMemorial.guestbook || [])
  }

  const handleReactionAdd = async (entryId: string, emoji: string) => {
    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryId, emoji }),
      });

      if (response.ok) {
        await handleEntryAdded(); // Refresh entries
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleScanDetected = (scanData: any) => {
    console.log('Scan detected:', scanData);
    // Could show a notification or track additional analytics
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          {memorial.gallery?.[0] && (
            <img
              src={urlForImage(memorial.gallery[0]).url()}
              alt={memorial.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{memorial.title}</h1>
              {memorial.subtitle && (
                <p className="text-xl mb-2">{memorial.subtitle}</p>
              )}
              <div className="text-lg">
                {memorial.bornAt?.location && memorial.diedAt?.location && (
                  <p>{memorial.bornAt.location} - {memorial.diedAt.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {memorial.timeline && memorial.timeline.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Life Timeline</h2>
            <TimelineComponent events={memorial.timeline} layout="vertical" />
          </div>
        )}

        {/* Location Map */}
        {memorial.bornAt?.coordinates && memorial.diedAt?.coordinates && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Life Journey Map</h2>
            <div className="relative">
              <Suspense fallback={<div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />}>
                <LocationMap bornAt={memorial.bornAt} diedAt={memorial.diedAt} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Story */}
        {memorial.storyBlocks && memorial.storyBlocks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Life Story</h2>
            <div className="prose max-w-none dark:prose-invert">
              <StoryRenderer blocks={memorial.storyBlocks} />
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {memorial.gallery && memorial.gallery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {memorial.gallery.map((image, index) => (
                <div key={image._key || index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={urlForImage(image).url()}
                    alt={image.alt || `${memorial.title} - Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {memorial.videos && memorial.videos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Video Memories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memorial.videos.map((video, index) => (
                <VideoPlayer key={video._key || index} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Audio Memories */}
        {memorial.audioMemories && memorial.audioMemories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Audio Memories</h2>
            <div className="space-y-4">
              {memorial.audioMemories.map((audio, index) => (
                <AudioPlayer key={audio._key || index} audio={audio} />
              ))}
            </div>
          </div>
        )}

        {/* NFC & QR Code */}
        <div className="mb-12">
          <NFCIntegration memorial={memorial} onScanDetected={handleScanDetected} />
        </div>

        {/* Guestbook */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Guestbook</h2>
          <AddGuestbookEntry memorialId={memorial._id} onEntryAdded={handleEntryAdded} />
          <div className="mt-8 space-y-6">
            {guestbookEntries.length > 0 ? (
              guestbookEntries.map((entry) => (
                <div key={entry._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{entry.author}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{entry.message}</p>
                  <GuestbookReactions entry={entry} onReactionAdd={handleReactionAdd} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No entries yet. Be the first to leave a message.
              </p>
            )}
          </div>
        </div>

        {/* Share */}
        <div className="mt-8">
          <ShareMemorial memorial={memorial} />
        </div>

        {/* Stats */}
        <div className="mt-8">
          <MemorialStats memorial={memorial} />
        </div>
      </div>
    </div>
  );
} 
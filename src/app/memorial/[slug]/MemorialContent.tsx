'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { urlForImage, client } from '@/lib/sanity';
import { Memorial, GuestbookEntry } from '@/types/memorial';
import MemorialGallery from '@/components/memorial/MemorialGallery';
import MemorialTimeline from '@/components/memorial/MemorialTimeline';
import MemorialStats from '@/components/memorial/MemorialStats';
import ShareMemorial from '@/components/memorial/ShareMemorial';
import StoryRenderer from '@/components/memorial/StoryRenderer';
import AddGuestbookEntry from '@/components/memorial/AddGuestbookEntry';
import dynamic from 'next/dynamic';

// Dynamically import the LocationMap component to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/memorial/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />,
  suspense: true
});

interface MemorialContentProps {
  memorial: Memorial;
}

export default function MemorialContent({ memorial }: MemorialContentProps) {
  const [guestbookEntries, setGuestbookEntries] = useState(memorial.guestbook || [])

  useEffect(() => {
    // Debug location data
    console.log('Memorial data:', {
      name: memorial.name,
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
          status
        }
      }`,
      { id: memorial._id }
    )
    setGuestbookEntries(updatedMemorial.guestbook || [])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          {memorial.gallery?.[0] && (
            <img
              src={urlForImage(memorial.gallery[0]).url()}
              alt={memorial.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{memorial.name}</h1>
              <p className="text-xl">
                {new Date(memorial.born).getFullYear()} - {new Date(memorial.died).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Life Journey</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-24 text-gray-600">{new Date(memorial.born).getFullYear()}</div>
              <div className="flex-1">
                <p className="font-medium">
                  Born {memorial.bornAt?.location ? `in ${memorial.bornAt.location}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 text-gray-600">{new Date(memorial.died).getFullYear()}</div>
              <div className="flex-1">
                <p className="font-medium">
                  Died {memorial.diedAt?.location ? `in ${memorial.diedAt.location}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        {memorial.bornAt?.coordinates && memorial.diedAt?.coordinates && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Life Journey Map</h2>
            <div className="relative">
              <LocationMap bornAt={memorial.bornAt} diedAt={memorial.diedAt} />
            </div>
          </div>
        )}

        {/* Description */}
        {memorial.description && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{memorial.description}</p>
          </div>
        )}

        {/* Story */}
        {memorial.storyBlocks && memorial.storyBlocks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Story</h2>
            <div className="prose max-w-none">
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
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={urlForImage(image).url()}
                    alt={image.alt || `${memorial.name} - Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guestbook */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Guestbook</h2>
          <AddGuestbookEntry memorialId={memorial._id} onEntryAdded={handleEntryAdded} />
          <div className="mt-8 space-y-6">
            {guestbookEntries.length > 0 ? (
              guestbookEntries.map((entry) => (
                <div key={entry._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{entry.author}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{entry.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No entries yet. Be the first to leave a message.</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <MemorialStats memorial={memorial} />
        </div>

        {/* Share */}
        <div className="mt-8">
          <ShareMemorial memorial={memorial} />
        </div>
      </div>
    </div>
  );
} 
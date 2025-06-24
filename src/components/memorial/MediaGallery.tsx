'use client'

import React from 'react';
import VideoPlayer from '@/components/memorial/VideoPlayer';
import AudioPlayer from '@/components/memorial/AudioPlayer';
import { Video, AudioMemory } from '@/types/memorial';

interface MediaGalleryProps {
  videos?: Video[];
  audioMemories?: AudioMemory[];
  className?: string;
}

export function MediaGallery({ videos, audioMemories, className = "" }: MediaGalleryProps) {
  const hasVideos = videos && videos.length > 0;
  const hasAudio = audioMemories && audioMemories.length > 0;

  if (!hasVideos && !hasAudio) {
    return null;
  }

  return (
    <div className={className}>
      {/* Video Memories */}
      {hasVideos && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Video Memories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <VideoPlayer key={video._key || index} video={video} />
            ))}
          </div>
          
          {/* Video counter */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>
        </section>
      )}

      {/* Audio Memories */}
      {hasAudio && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Audio Memories</h2>
          <div className="space-y-4">
            {audioMemories.map((audio, index) => (
              <AudioPlayer key={audio._key || index} audio={audio} />
            ))}
          </div>
          
          {/* Audio counter */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {audioMemories.length} {audioMemories.length === 1 ? 'recording' : 'recordings'}
            </p>
          </div>
        </section>
      )}
    </div>
  );
} 
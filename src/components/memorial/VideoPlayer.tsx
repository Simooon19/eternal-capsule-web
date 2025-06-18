import React, { useState, useRef } from 'react';
import { Video } from '@/types/memorial';

interface VideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  muted?: boolean;
}

export default function VideoPlayer({ video, autoplay = false, muted = true }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative group">
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-900"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-auto"
          src={video.url}
          autoPlay={autoplay}
          muted={muted}
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          poster={video.url.replace(/\.[^.]+$/, '-thumbnail.jpg')} // Assume thumbnail exists
        >
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause overlay */}
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity duration-200 cursor-pointer ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-8 h-8 text-gray-900 ml-1" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M8 5v10l8-5-8-5z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Video controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center space-x-2 text-white">
              <button
                onClick={togglePlay}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4h3v12H6V4zm5 0h3v12h-3V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                )}
              </button>
              
              <div className="flex-1">
                <div className="text-sm font-medium truncate">
                  {video.title || 'Video Memory'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video info */}
      {(video.title || video.description) && (
        <div className="mt-3">
          {video.title && (
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {video.title}
            </h3>
          )}
          {video.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {video.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { AudioMemory } from '@/types/memorial';

interface AudioPlayerProps {
  audio: AudioMemory;
}

export default function AudioPlayer({ audio }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    
    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <audio
        ref={audioRef}
        src={audio.url}
        preload="metadata"
      />

      {/* Audio info */}
      <div className="mb-4">
        {audio.title && (
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {audio.title}
          </h3>
        )}
        {audio.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {audio.description}
          </p>
        )}
      </div>

      {/* Player controls */}
      <div className="space-y-3">
        {/* Play button and time */}
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4h3v12H6V4zm5 0h3v12h-3V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5-8-5z"/>
              </svg>
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* Progress bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.783L4.476 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.476l3.907-3.783a1 1 0 011.617.783zM14.657 5.343a1 1 0 010 1.414 3 3 0 010 4.243 1 1 0 11-1.414-1.414 1 1 0 000-1.414 1 1 0 011.414-1.414zM16.364 3.636a1 1 0 010 1.414 7 7 0 010 9.9 1 1 0 11-1.414-1.414 5 5 0 000-7.072 1 1 0 011.414-1.414z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
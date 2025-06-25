'use client'

import { useState, useEffect } from 'react';
import MemorialCard from '@/components/MemorialCard';
import type { Memorial } from '@/types/memorial';

interface LocationBasedObituariesProps {
  obituaries: Memorial[];
}

interface UserLocation {
  lat: number;
  lng: number;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Calculate relevance score combining recency and proximity
function calculateRelevanceScore(
  memorial: Memorial, 
  userLocation: UserLocation | null,
  now: Date
): number {
  // Recency score (0-1, where 1 is most recent)
  const createdDate = new Date(memorial._createdAt);
  const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  const maxDays = 365; // Consider memorials from last year
  const recencyScore = Math.max(0, 1 - (daysSinceCreation / maxDays));

  // Proximity score (0-1, where 1 is closest)
  let proximityScore = 0.5; // Default neutral score
  
  if (userLocation && memorial.diedAt?.coordinates) {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      memorial.diedAt.coordinates.lat,
      memorial.diedAt.coordinates.lng
    );
    const maxDistance = 100; // Consider up to 100km as relevant
    proximityScore = Math.max(0, 1 - (distance / maxDistance));
  } else if (userLocation && memorial.personalInfo?.restingPlace?.coordinates) {
    // Fall back to resting place if death location not available
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      memorial.personalInfo.restingPlace.coordinates.lat,
      memorial.personalInfo.restingPlace.coordinates.lng
    );
    const maxDistance = 100;
    proximityScore = Math.max(0, 1 - (distance / maxDistance));
  }

  // Weighted combination: 70% recency, 30% proximity
  return (recencyScore * 0.7) + (proximityScore * 0.3);
}

export default function LocationBasedObituaries({ obituaries }: LocationBasedObituariesProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [sortedObituaries, setSortedObituaries] = useState<Memorial[]>(obituaries);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    // Try to get user's location
    const getUserLocation = async () => {
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes cache
            });
          });

          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          setLocationPermission('granted');
        } catch (error) {
          console.log('Location access denied or failed:', error);
          setLocationPermission('denied');
        }
      } else {
        setLocationPermission('denied');
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    // Sort obituaries based on relevance score
    const now = new Date();
    const sorted = [...obituaries].sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, userLocation, now);
      const scoreB = calculateRelevanceScore(b, userLocation, now);
      return scoreB - scoreA; // Descending order (highest score first)
    });

    setSortedObituaries(sorted);
  }, [obituaries, userLocation]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-granite-900 mb-4 text-center border-b border-granite-300 pb-2">
            Senaste Dödsannonserna
          </h2>
          
          {locationPermission === 'granted' && userLocation && (
            <p className="text-sm text-granite-600 text-center">
              Sorterat efter närhet och aktualitet baserat på din plats
            </p>
          )}
          
          {locationPermission === 'denied' && (
            <p className="text-sm text-granite-600 text-center">
              Sorterat efter aktualitet • Tillåt plats för närhetssortl
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedObituaries.slice(0, 24).map((obituary) => (
            <div key={obituary._id} className="bg-white border border-granite-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <MemorialCard memorial={obituary} />
            </div>
          ))}
        </div>
        
        {sortedObituaries.length > 24 && (
          <div className="text-center mt-8">
            <p className="text-granite-600 text-sm">
              Visar de 24 senaste dödsannonserna
              {userLocation && ' baserat på din plats och aktualitet'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
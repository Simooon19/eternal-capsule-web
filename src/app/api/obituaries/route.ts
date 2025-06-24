import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { Memorial } from '@/types/memorial';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '50'); // miles
    const period = parseInt(searchParams.get('period') || '30'); // days
    const sortBy = searchParams.get('sortBy') || 'date';
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Location coordinates required' },
        { status: 400 }
      );
    }

    // Calculate date cutoff
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);
    const cutoffISOString = cutoffDate.toISOString();

    // Fetch memorials from Sanity
    const query = `*[_type == "memorial" && 
                     status == "published" && 
                     privacy != "password-protected" && 
                     (died > "${cutoffISOString}" || personalInfo.dateOfDeath > "${cutoffISOString}") &&
                     (defined(diedAt.coordinates) || defined(personalInfo.restingPlace.coordinates))] {
      _id,
      title,
      name,
      subtitle,
      description,
      slug,
      born,
      died,
      bornAt,
      diedAt,
      personalInfo {
        dateOfBirth,
        dateOfDeath,
        birthLocation,
        deathLocation,
        restingPlace {
          cemetery,
          coordinates
        }
      },
      coverImage,
      gallery,
      viewCount,
      guestbook,
      tags,
      _createdAt
    }`;

    const memorials: (Memorial & {
      personalInfo?: {
        dateOfBirth?: string;
        dateOfDeath?: string;
        birthLocation?: string;
        deathLocation?: string;
        restingPlace?: {
          cemetery?: string;
          coordinates?: { lat: number; lng: number };
        };
      };
    })[] = await client.fetch(query);

    // Transform and filter by distance and calculate additional fields
    const filteredMemorials = memorials
      .map(memorial => {
        // Transform to handle both old and new schema
        const transformedMemorial = {
          ...memorial,
          born: memorial.personalInfo?.dateOfBirth || memorial.born,
          died: memorial.personalInfo?.dateOfDeath || memorial.died,
          diedAt: {
            location: memorial.personalInfo?.deathLocation || memorial.diedAt?.location,
            coordinates: memorial.personalInfo?.restingPlace?.coordinates || memorial.diedAt?.coordinates
          }
        };

        // Skip if no valid coordinates
        if (!transformedMemorial.diedAt?.coordinates) return null;
        
        const distance = calculateDistance(
          lat, lng,
          transformedMemorial.diedAt.coordinates.lat, transformedMemorial.diedAt.coordinates.lng
        );
        
        if (distance > radius) return null;
        
        const daysAgo = Math.floor((Date.now() - new Date(transformedMemorial.died!).getTime()) / (1000 * 60 * 60 * 24));
        const engagement = (transformedMemorial.viewCount || 0) + (transformedMemorial.guestbook?.length || 0) * 2;
        
        return {
          ...transformedMemorial,
          distance: Math.round(distance * 10) / 10,
          daysAgo,
          engagement
        };
      })
      .filter(Boolean);

    // Sort based on sortBy parameter
    filteredMemorials.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a!.distance - b!.distance;
        case 'date':
          return new Date(b!.died!).getTime() - new Date(a!.died!).getTime();
        case 'engagement':
          return b!.engagement - a!.engagement;
        default:
          return new Date(b!.died!).getTime() - new Date(a!.died!).getTime();
      }
    });

    return NextResponse.json({
      obituaries: filteredMemorials,
      count: filteredMemorials.length,
      location: { lat, lng },
      filters: { radius, period, sortBy }
    });

  } catch (error) {
    console.error('Error fetching obituaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch obituaries' },
      { status: 500 }
    );
  }
} 
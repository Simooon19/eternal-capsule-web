'use client'

import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

interface LocationMapProps {
  bornAt: {
    location: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  diedAt: {
    location: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  restingPlace?: {
    location: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

// Simple client-side geocoder (OpenStreetMap Nominatim)
async function geocode(text: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`);
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
  } catch (err) {
    // Geocoding failed silently
  }
  return null;
}

const LocationMap = ({ bornAt, diedAt, restingPlace }: LocationMapProps) => {
  const [isClient, setIsClient] = useState(false)
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null)
  const [resolvedBorn, setResolvedBorn] = useState<typeof bornAt | null>(bornAt)
  const [resolvedDied, setResolvedDied] = useState<typeof diedAt | null>(diedAt)
  const [resolvedResting, setResolvedResting] = useState<typeof restingPlace | null>(restingPlace || null)

  useEffect(() => {
    setIsClient(true)
    
    // Load map component only on client
    const loadMap = async () => {
      try {
        // Dynamic imports for client-side only
        const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
        
        // Create the map component using React-Leaflet 4.2.1
        const Map = ({ bornAt, diedAt, restingPlace }: { bornAt: any, diedAt: any, restingPlace?: any }) => {
          let center: [number, number] = [0, 0]
          let zoom = 2
          
          // Calculate center from all available coordinates
          const coordinates = [
            bornAt.coordinates,
            diedAt.coordinates,
            restingPlace?.coordinates
          ].filter(Boolean);
          
          if (coordinates.length > 0) {
            const avgLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
            const avgLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
            center = [avgLat, avgLng];
            zoom = coordinates.length === 1 ? 8 : coordinates.length === 2 ? 6 : 5;
          }

          return (
            <div className="h-[400px] w-full rounded-lg overflow-hidden">
              <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {bornAt.coordinates && (
                  <Marker position={[bornAt.coordinates.lat, bornAt.coordinates.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">Född</p>
                        <p>{bornAt.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                {diedAt.coordinates && (
                  <Marker position={[diedAt.coordinates.lat, diedAt.coordinates.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">Avled</p>
                        <p>{diedAt.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                {restingPlace?.coordinates && (
                  <Marker position={[restingPlace.coordinates.lat, restingPlace.coordinates.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">Vila</p>
                        <p>{restingPlace.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          )
        }

        const WrappedMap = (props: any) => <Map {...props} restingPlace={resolvedResting} />
        WrappedMap.displayName = 'WrappedMap'
        setMapComponent(() => WrappedMap)
      } catch (error) {
        // Failed to load map components
      }
    }

    loadMap()

    // Geocode locations if coordinates missing
    const geocodeLocations = async () => {
      if ((!bornAt.coordinates || isNaN(bornAt.coordinates.lat)) && bornAt.location) {
        const res = await geocode(bornAt.location)
        if (res) setResolvedBorn({ ...bornAt, coordinates: res })
      }
      if ((!diedAt.coordinates || isNaN(diedAt.coordinates.lat)) && diedAt.location) {
        const res = await geocode(diedAt.location)
        if (res) setResolvedDied({ ...diedAt, coordinates: res })
      }
      if (restingPlace && (!restingPlace.coordinates || isNaN(restingPlace.coordinates.lat)) && restingPlace.location) {
        const res = await geocode(restingPlace.location)
        if (res) setResolvedResting({ ...restingPlace, coordinates: res })
      }
    }

    geocodeLocations()
  }, [bornAt, diedAt, restingPlace, resolvedResting])

  if (!isClient || !MapComponent) {
    return <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />
  }

  // Only render map when at least one set of coordinates is available
  if (!resolvedBorn?.coordinates && !resolvedDied?.coordinates && !resolvedResting?.coordinates) {
    return <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 text-sm">Location data unavailable.</p>
    </div>
  }

  return <MapComponent bornAt={resolvedBorn!} diedAt={resolvedDied!} restingPlace={resolvedResting} />
}

export { LocationMap } 
'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMap } from './MapProvider'

interface MapComponentProps {
  bornAt: {
    location: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  diedAt: {
    location: string
    coordinates: {
      lat: number
      lng: number
    }
  }
}

export function MapComponent({ bornAt, diedAt }: MapComponentProps) {
  const { isMapReady, error } = useMap()
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    try {
      // Validate coordinates
      const isValidBorn = !isNaN(bornAt.coordinates.lat) && !isNaN(bornAt.coordinates.lng)
      const isValidDied = !isNaN(diedAt.coordinates.lat) && !isNaN(diedAt.coordinates.lng)
      setIsValid(isValidBorn && isValidDied)
    } catch (err) {
      console.error('Error validating coordinates:', err)
    }
  }, [bornAt, diedAt])

  if (error) {
    return <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Failed to load map: {error}</p>
    </div>
  }

  if (!isMapReady || !isValid) {
    return <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />
  }

  const center = {
    lat: (bornAt.coordinates.lat + diedAt.coordinates.lat) / 2,
    lng: (bornAt.coordinates.lng + diedAt.coordinates.lng) / 2
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[bornAt.coordinates.lat, bornAt.coordinates.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Born</p>
              <p>{bornAt.location}</p>
            </div>
          </Popup>
        </Marker>
        <Marker position={[diedAt.coordinates.lat, diedAt.coordinates.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Died</p>
              <p>{diedAt.location}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
} 
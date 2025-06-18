'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapProvider } from './MapProvider'
import 'leaflet/dist/leaflet.css'

// Move Leaflet initialization to a client-side only effect
const LocationMap = ({ bornAt, diedAt }: LocationMapProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    // Dynamically import Leaflet only on client side
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
      // Fix for default marker icons in Leaflet with Next.js
      const DefaultIcon = leaflet.default.icon({
        iconUrl: '/images/marker-icon.png',
        iconRetinaUrl: '/images/marker-icon-2x.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      leaflet.default.Marker.prototype.options.icon = DefaultIcon
    })
  }, [])

  const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />
    )
  })

  if (!isMounted || !L) {
    return <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />
  }

  return (
    <MapProvider>
      <MapComponent bornAt={bornAt} diedAt={diedAt} />
    </MapProvider>
  )
}

export { LocationMap }

interface LocationMapProps {
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
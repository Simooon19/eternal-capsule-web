'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

interface MapContextType {
  isMapReady: boolean
  error: string | null
}

const MapContext = createContext<MapContextType>({
  isMapReady: false,
  error: null
})

export function useMap() {
  return useContext(MapContext)
}

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [isMapReady, setIsMapReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (typeof window !== 'undefined') {
          const L = await import('leaflet')
          // Fix for default marker icons in Leaflet with Next.js
          const DefaultIcon = L.default.icon({
            iconUrl: '/images/marker-icon.png',
            iconRetinaUrl: '/images/marker-icon-2x.png',
            shadowUrl: '/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
          L.default.Marker.prototype.options.icon = DefaultIcon
          setIsMapReady(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize map')
      }
    }

    initializeMap()
  }, [])

  return (
    <MapContext.Provider value={{ isMapReady, error }}>
      {children}
    </MapContext.Provider>
  )
} 
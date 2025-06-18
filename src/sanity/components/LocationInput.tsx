import { useEffect, useState } from 'react'
import { set } from 'sanity'
import { Stack, TextInput } from '@sanity/ui'

export function LocationInput(props: any) {
  const { value, onChange } = props
  const [location, setLocation] = useState(value?.location || '')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (location && location !== value?.location) {
      setIsLoading(true)
      // Use OpenStreetMap Nominatim API to get coordinates
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]) {
            const { lat, lon } = data[0]
            onChange(
              set({
                location,
                coordinates: {
                  lat: parseFloat(lat),
                  lng: parseFloat(lon),
                },
              })
            )
          }
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  }, [location, onChange, value?.location])

  return (
    <Stack space={3}>
      <TextInput
        value={location}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLocation(event.currentTarget.value)}
        placeholder="Enter city, country"
        disabled={isLoading}
      />
      {isLoading && <div>Loading coordinates...</div>}
      {value?.coordinates && (
        <div>
          <strong>Coordinates:</strong> {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
        </div>
      )}
    </Stack>
  )
} 
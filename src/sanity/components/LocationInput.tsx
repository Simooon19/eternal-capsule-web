import { useCallback, useEffect, useState } from 'react'
import { set } from 'sanity'
import { Stack, TextInput, Text, Spinner, Flex, Card, Grid } from '@sanity/ui'
import { CheckmarkIcon, WarningOutlineIcon } from '@sanity/icons'

interface LocationData {
  location: string
  coordinates?: {
    lat: number
    lng: number
    alt?: number
  }
  geocodingInfo?: {
    displayName: string
    type: string
    importance: number
  }
}

interface RestingPlaceData {
  cemetery?: string
  location?: string
  section?: string
  coordinates?: {
    lat: number
    lng: number
    alt?: number
  }
  geocodingInfo?: {
    displayName: string
    type: string
    importance: number
  }
}

interface LocationInputProps {
  value?: LocationData
  onChange: (value: any) => void
  placeholder?: string
  disabled?: boolean
}

interface RestingPlaceInputProps {
  value?: RestingPlaceData
  onChange: (value: any) => void
  disabled?: boolean
}

export function LocationInput({ 
  value, 
  onChange, 
  placeholder = "Enter city, country (e.g., Stockholm, Sweden)",
  disabled = false 
}: LocationInputProps) {
  const [location, setLocation] = useState(value?.location || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Debounced geocoding function
  const debouncedGeocode = useCallback(
    debounce((locationText: string) => {
      if (!locationText.trim()) {
        onChange(set({ location: '', coordinates: undefined }))
        return
      }

      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Use OpenStreetMap Nominatim API with better parameters
      const params = new URLSearchParams({
        format: 'json',
        q: locationText,
        limit: '1',
        addressdetails: '1',
        extratags: '1'
      })

      fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'EternalCapsule/1.0'
        }
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error('Geocoding service unavailable')
          }
          return res.json()
        })
        .then((data) => {
          if (data && data[0]) {
            const result = data[0]
            const lat = parseFloat(result.lat)
            const lng = parseFloat(result.lon)
            
            if (isNaN(lat) || isNaN(lng)) {
              throw new Error('Invalid coordinates received')
            }

            onChange(
              set({
                location: locationText,
                coordinates: {
                  lat,
                  lng,
                  alt: 0 // Default altitude
                },
                // Store additional geocoding info for reference
                geocodingInfo: {
                  displayName: result.display_name,
                  type: result.type,
                  importance: result.importance
                }
              })
            )
            setSuccess(true)
          } else {
            setError('Location not found. Please try a more specific address.')
          }
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Geocoding error:', err)
          setError(err.message || 'Unable to find location. Please check your internet connection.')
          setIsLoading(false)
        })
    }, 1000),
    [onChange]
  )

  useEffect(() => {
    if (location !== value?.location) {
      debouncedGeocode(location)
    }
  }, [location, debouncedGeocode, value?.location])

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = event.currentTarget.value
    setLocation(newLocation)
    setSuccess(false)
    setError(null)
  }

  return (
    <Stack space={3}>
      <Flex align="center" gap={2}>
        <TextInput
          value={location}
          onChange={handleLocationChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          style={{ flex: 1 }}
        />
        {isLoading && <Spinner size={1} />}
        {success && !isLoading && <CheckmarkIcon style={{ color: 'green' }} />}
        {error && !isLoading && <WarningOutlineIcon style={{ color: 'red' }} />}
      </Flex>

      {error && (
        <Card padding={2} tone="critical" style={{ fontSize: '12px' }}>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {value?.coordinates && !error && (
        <Card padding={2} tone="positive" style={{ fontSize: '12px' }}>
          <Text size={1}>
            <strong>📍 Coordinates:</strong> {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
          </Text>
          {value.geocodingInfo?.displayName && (
            <Text size={1} style={{ opacity: 0.7, marginTop: '4px' }}>
              Found: {value.geocodingInfo.displayName}
            </Text>
          )}
        </Card>
      )}

      <Text size={1} style={{ opacity: 0.6 }}>
        💡 Tip: Use format "City, Country" for best results (e.g., "Stockholm, Sweden", "New York, USA")
      </Text>
    </Stack>
  )
}

export function RestingPlaceInput({ 
  value, 
  onChange, 
  disabled = false 
}: RestingPlaceInputProps) {
  const [cemetery, setCemetery] = useState(value?.cemetery || '')
  const [location, setLocation] = useState(value?.location || '')
  const [section, setSection] = useState(value?.section || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Debounced geocoding function for cemetery location
  const debouncedGeocode = useCallback(
    debounce((cemeteryName: string, locationText: string) => {
      if (!locationText.trim() && !cemeteryName.trim()) {
        onChange(set({ 
          cemetery: cemeteryName, 
          location: locationText, 
          section,
          coordinates: undefined 
        }))
        return
      }

      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Combine cemetery name and location for better geocoding
      const searchQuery = [cemeteryName, locationText].filter(Boolean).join(', ')
      
      const params = new URLSearchParams({
        format: 'json',
        q: searchQuery,
        limit: '1',
        addressdetails: '1',
        extratags: '1'
      })

      fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'EternalCapsule/1.0'
        }
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error('Geocoding service unavailable')
          }
          return res.json()
        })
        .then((data) => {
          if (data && data[0]) {
            const result = data[0]
            const lat = parseFloat(result.lat)
            const lng = parseFloat(result.lon)
            
            if (isNaN(lat) || isNaN(lng)) {
              throw new Error('Invalid coordinates received')
            }

            onChange(
              set({
                cemetery: cemeteryName,
                location: locationText,
                section,
                coordinates: {
                  lat,
                  lng,
                  alt: 0
                },
                geocodingInfo: {
                  displayName: result.display_name,
                  type: result.type,
                  importance: result.importance
                }
              })
            )
            setSuccess(true)
          } else {
            // Update without coordinates if not found
            onChange(
              set({
                cemetery: cemeteryName,
                location: locationText,
                section,
                coordinates: undefined
              })
            )
            if (searchQuery.trim()) {
              setError('Cemetery location not found automatically. You can add coordinates manually if needed.')
            }
          }
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Geocoding error:', err)
          setError(err.message || 'Unable to find cemetery location automatically.')
          setIsLoading(false)
          // Still save the input values
          onChange(
            set({
              cemetery: cemeteryName,
              location: locationText,
              section,
              coordinates: undefined
            })
          )
        })
    }, 1500),
    [onChange, section]
  )

  useEffect(() => {
    if (cemetery !== value?.cemetery || location !== value?.location) {
      debouncedGeocode(cemetery, location)
    }
  }, [cemetery, location, debouncedGeocode, value?.cemetery, value?.location])

  return (
    <Stack space={3}>
      <Grid columns={[1, 1, 2]} gap={3}>
        <TextInput
          value={cemetery}
          onChange={(e) => setCemetery(e.currentTarget.value)}
          placeholder="Cemetery name (e.g., Skogskyrkogården)"
          disabled={disabled || isLoading}
        />
        <Flex align="center" gap={2}>
          <TextInput
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            placeholder="City, Country"
            disabled={disabled || isLoading}
            style={{ flex: 1 }}
          />
          {isLoading && <Spinner size={1} />}
          {success && !isLoading && <CheckmarkIcon style={{ color: 'green' }} />}
          {error && !isLoading && <WarningOutlineIcon style={{ color: 'red' }} />}
        </Flex>
      </Grid>
      
      <TextInput
        value={section}
        onChange={(e) => setSection(e.currentTarget.value)}
        placeholder="Section/Plot (e.g., Section A, Plot 15)"
        disabled={disabled}
      />

      {error && (
        <Card padding={2} tone="caution" style={{ fontSize: '12px' }}>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {value?.coordinates && !error && (
        <Card padding={2} tone="positive" style={{ fontSize: '12px' }}>
          <Text size={1}>
            <strong>📍 Cemetery Location:</strong> {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
          </Text>
          {value.geocodingInfo?.displayName && (
            <Text size={1} style={{ opacity: 0.7, marginTop: '4px' }}>
              Found: {value.geocodingInfo.displayName}
            </Text>
          )}
        </Card>
      )}

      <Text size={1} style={{ opacity: 0.6 }}>
        💡 Add cemetery name and city for automatic location finding. Section/plot helps visitors find the exact grave.
      </Text>
    </Stack>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 
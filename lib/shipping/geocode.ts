export type GeoPoint = { lat: number; lng: number }

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const GOONG_GEOCODE = 'https://rsapi.goong.io/Geocode'

/** Resolve a free-text address (used for legacy callers). */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const q = address.trim()
  if (!q) return null

  const goongKey = process.env.GOONG_API_KEY?.trim()
  if (goongKey) {
    const pt = await geocodeGoong(q, goongKey)
    if (pt) return pt
  }

  return geocodeNominatim(q)
}

export { geocodeVietnamParts } from '@/lib/shipping/geocode-vietnam'

async function geocodeGoong(address: string, apiKey: string): Promise<GeoPoint | null> {
  const url = new URL(GOONG_GEOCODE)
  url.searchParams.set('address', address)
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as {
    results?: { geometry?: { location?: { lat?: number; lng?: number } } }[]
  }
  const loc = data.results?.[0]?.geometry?.location
  if (loc?.lat == null || loc?.lng == null) return null
  return { lat: loc.lat, lng: loc.lng }
}

async function geocodeNominatim(address: string): Promise<GeoPoint | null> {
  const url = new URL(NOMINATIM)
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'vn')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': process.env.NOMINATIM_USER_AGENT ?? 'TFlowers/1.0 (flower shop delivery)',
    },
  })
  if (!res.ok) return null

  const data = (await res.json()) as { lat?: string; lon?: string }[]
  const hit = data[0]
  if (!hit?.lat || !hit.lon) return null
  const lat = Number(hit.lat)
  const lng = Number(hit.lon)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

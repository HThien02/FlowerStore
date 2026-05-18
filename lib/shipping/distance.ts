import type { GeoPoint } from './geocode'

const GOONG_MATRIX = 'https://rsapi.goong.io/DistanceMatrix'
const OSRM_ROUTE = 'https://router.project-osrm.org/route/v1/driving'

/** Road distance in km between two points. */
export async function roadDistanceKm(origin: GeoPoint, destination: GeoPoint): Promise<number> {
  const goongKey = process.env.GOONG_API_KEY?.trim()
  if (goongKey) {
    const km = await distanceGoong(origin, destination, goongKey)
    if (km != null) return km
  }

  const osrmKm = await distanceOsrm(origin, destination)
  if (osrmKm != null) return osrmKm

  return haversineKm(origin, destination) * 1.35
}

async function distanceGoong(
  origin: GeoPoint,
  destination: GeoPoint,
  apiKey: string
): Promise<number | null> {
  const origins = `${origin.lat},${origin.lng}`
  const destinations = `${destination.lat},${destination.lng}`
  const url = new URL(GOONG_MATRIX)
  url.searchParams.set('origins', origins)
  url.searchParams.set('destinations', destinations)
  url.searchParams.set('vehicle', 'car')
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as {
    rows?: { elements?: { distance?: { value?: number }; status?: string }[] }[]
  }
  const meters = data.rows?.[0]?.elements?.[0]?.distance?.value
  if (meters == null) return null
  return meters / 1000
}

async function distanceOsrm(origin: GeoPoint, destination: GeoPoint): Promise<number | null> {
  const path = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  const url = `${OSRM_ROUTE}/${path}?overview=false`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = (await res.json()) as { routes?: { distance?: number }[] }
    const meters = data.routes?.[0]?.distance
    if (meters == null) return null
    return meters / 1000
  } catch {
    return null
  }
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

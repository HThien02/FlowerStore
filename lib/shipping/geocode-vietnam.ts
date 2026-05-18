import type { VietnamAddressParts } from '@/lib/vietnam-address/types'
import type { GeoPoint } from '@/lib/shipping/geocode'

export type GeocodePrecision = 'street' | 'ward' | 'district' | 'province'

export type VietnamGeocodeResult = {
  point: GeoPoint
  precision: GeocodePrecision
  formattedAddress?: string
}

const GOONG_V2 = 'https://rsapi.goong.io/v2/geocode'
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

export type BuildGeocodeQueriesOptions = {
  /** When street is required, only try full street-level queries (saves API calls). */
  streetLevelOnly?: boolean
}

/** Goong-style: street, ward, district, city */
export function buildGeocodeQueries(
  parts: VietnamAddressParts,
  options: BuildGeocodeQueriesOptions = {}
): string[] {
  const street = parts.addressDetail.trim()
  const ward = parts.wardName.trim()
  const district = parts.districtName.trim()
  const province = parts.provinceName.trim()

  const queries: string[] = []
  if (street) {
    queries.push([street, ward, district, province, 'Việt Nam'].filter(Boolean).join(', '))
    if (!options.streetLevelOnly) {
      queries.push([street, ward, district, province].filter(Boolean).join(', '))
    }
  }
  if (!options.streetLevelOnly) {
    if (ward) {
      queries.push([ward, district, province, 'Việt Nam'].filter(Boolean).join(', '))
    }
    if (district) {
      queries.push([district, province, 'Việt Nam'].filter(Boolean).join(', '))
    }
  }
  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))]
}

function precisionRank(p: GeocodePrecision): number {
  return { street: 4, ward: 3, district: 2, province: 1 }[p]
}

function isPreciseEnough(
  precision: GeocodePrecision,
  parts: VietnamAddressParts,
  minPrecision: GeocodePrecision
): boolean {
  if (precisionRank(precision) < precisionRank(minPrecision)) return false
  const hasStreet = Boolean(parts.addressDetail.trim())
  if (hasStreet && precision !== 'street') return false
  return true
}

function inferNominatimPrecision(hit: {
  class?: string
  type?: string
  addresstype?: string
}): GeocodePrecision {
  const c = hit.class ?? ''
  const t = hit.type ?? ''
  const a = hit.addresstype ?? ''

  if (
    c === 'building' ||
    c === 'amenity' ||
    c === 'shop' ||
    c === 'office' ||
    t === 'house' ||
    t === 'residential' ||
    t === 'apartments' ||
    c === 'highway' ||
    a === 'house' ||
    a === 'building' ||
    a === 'road'
  ) {
    return 'street'
  }
  if (t === 'suburb' || t === 'neighbourhood' || t === 'quarter' || t === 'village' || a === 'suburb') {
    return 'ward'
  }
  if (t === 'city' || t === 'town' || t === 'county' || t === 'municipality' || a === 'city') {
    return 'district'
  }
  if (t === 'state' || t === 'province' || a === 'state') {
    return 'province'
  }
  if (c === 'boundary') return 'district'
  return 'ward'
}

async function geocodeGoongV2(
  address: string,
  apiKey: string
): Promise<VietnamGeocodeResult | null> {
  const url = new URL(GOONG_V2)
  url.searchParams.set('address', address)
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as {
    results?: {
      formatted_address?: string
      geometry?: { location?: { lat?: number; lng?: number } }
      types?: string[]
    }[]
  }

  const hit = data.results?.[0]
  const loc = hit?.geometry?.location
  if (loc?.lat == null || loc?.lng == null) return null

  const types = hit.types ?? []
  let precision: GeocodePrecision = 'street'
  if (types.includes('administrative_area_level_1')) precision = 'province'
  else if (types.includes('administrative_area_level_2')) precision = 'district'
  else if (types.includes('administrative_area_level_3')) precision = 'ward'

  return {
    point: { lat: loc.lat, lng: loc.lng },
    precision,
    formattedAddress: hit.formatted_address,
  }
}

async function geocodeNominatimQuery(address: string): Promise<VietnamGeocodeResult | null> {
  const url = new URL(NOMINATIM)
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '3')
  url.searchParams.set('countrycodes', 'vn')
  url.searchParams.set('addressdetails', '1')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': process.env.NOMINATIM_USER_AGENT ?? 'TFlowers/1.0 (flower shop delivery)',
    },
  })
  if (!res.ok) return null

  const data = (await res.json()) as {
    lat?: string
    lon?: string
    display_name?: string
    class?: string
    type?: string
    addresstype?: string
  }[]

  for (const hit of data) {
    if (!hit.lat || !hit.lon) continue
    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue

    const precision = inferNominatimPrecision(hit)
    if (precision === 'province') continue

    return {
      point: { lat, lng },
      precision,
      formattedAddress: hit.display_name,
    }
  }

  return null
}

export type GeocodeVietnamOptions = {
  /** When user entered street — reject ward/district-only matches */
  requireStreetLevel?: boolean
}

const geocodeCache = new Map<string, { at: number; result: VietnamGeocodeResult | null }>()
const GEOCODE_CACHE_TTL_MS = 5 * 60 * 1000

function cacheKey(parts: VietnamAddressParts, minPrecision: GeocodePrecision): string {
  return [
    parts.addressDetail.trim(),
    parts.wardCode,
    parts.districtCode,
    parts.provinceCode,
    minPrecision,
  ].join('|')
}

function acceptResult(
  result: VietnamGeocodeResult,
  parts: VietnamAddressParts,
  minPrecision: GeocodePrecision,
  hasStreet: boolean
): boolean {
  if (isPreciseEnough(result.precision, parts, minPrecision)) return true
  return !hasStreet && isPreciseEnough(result.precision, parts, 'ward')
}

async function geocodeQuery(
  q: string,
  goongKey: string | undefined,
  parts: VietnamAddressParts,
  minPrecision: GeocodePrecision,
  hasStreet: boolean
): Promise<VietnamGeocodeResult | null> {
  if (goongKey) {
    const g = await geocodeGoongV2(q, goongKey)
    if (g && acceptResult(g, parts, minPrecision, hasStreet)) return g
  }

  const n = await geocodeNominatimQuery(q)
  if (n && acceptResult(n, parts, minPrecision, hasStreet)) return n

  return null
}

/**
 * Geocode Vietnamese structured address. Prefers Goong v2, then Nominatim.
 * Does not return coarse province/district pins when a street was provided.
 */
export async function geocodeVietnamParts(
  parts: VietnamAddressParts,
  options: GeocodeVietnamOptions = {}
): Promise<VietnamGeocodeResult | null> {
  const hasStreet = Boolean(parts.addressDetail.trim())
  const minPrecision: GeocodePrecision = options.requireStreetLevel || hasStreet ? 'street' : 'ward'

  const key = cacheKey(parts, minPrecision)
  const cached = geocodeCache.get(key)
  if (cached && Date.now() - cached.at < GEOCODE_CACHE_TTL_MS) {
    return cached.result
  }

  const streetLevelOnly = minPrecision === 'street' && hasStreet
  const queries = buildGeocodeQueries(parts, { streetLevelOnly })
  const goongKey = process.env.GOONG_API_KEY?.trim()

  let result: VietnamGeocodeResult | null = null
  for (let i = 0; i < queries.length; i++) {
    const q = queries[i]
    if (i > 0) await new Promise((r) => setTimeout(r, 1100))

    result = await geocodeQuery(q, goongKey, parts, minPrecision, hasStreet)
    if (result) break
  }

  geocodeCache.set(key, { at: Date.now(), result })
  return result
}

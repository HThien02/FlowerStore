import { getSupabaseServerClient } from '@/lib/supabase'
import type { VietnamAddressParts } from '@/lib/vietnam-address/types'
import { geocodeShopLocation } from '@/lib/shop/geocode-shop'

export type ShopSettings = {
  addressDetail: string
  provinceCode: string | null
  provinceName: string | null
  districtCode: string | null
  districtName: string | null
  wardCode: string | null
  wardName: string | null
  latitude: number | null
  longitude: number | null
}

type Row = {
  address_detail: string
  province_code: string | null
  province_name: string | null
  district_code: string | null
  district_name: string | null
  ward_code: string | null
  ward_name: string | null
  latitude: number | null
  longitude: number | null
}

function mapRow(row: Row): ShopSettings {
  return {
    addressDetail: row.address_detail ?? '',
    provinceCode: row.province_code,
    provinceName: row.province_name,
    districtCode: row.district_code,
    districtName: row.district_name,
    wardCode: row.ward_code,
    wardName: row.ward_name,
    latitude: row.latitude,
    longitude: row.longitude,
  }
}

export async function getShopSettings(): Promise<ShopSettings | null> {
  const admin = getSupabaseServerClient()
  const { data, error } = await admin.from('shop_settings').select('*').eq('id', 1).maybeSingle()
  if (error) {
    console.error('[getShopSettings]', error.message, error.code)
    return null
  }
  if (!data) return null
  return mapRow(data as Row)
}

async function persistShopCoordinates(lat: number, lng: number): Promise<void> {
  const admin = getSupabaseServerClient()
  const { error } = await admin
    .from('shop_settings')
    .update({ latitude: lat, longitude: lng, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) console.error('[persistShopCoordinates]', error.message)
}

/** Load shop settings; geocode on the fly if address saved but coordinates missing. */
export async function getShopSettingsWithCoordinates(): Promise<ShopSettings | null> {
  const shop = await getShopSettings()
  if (!shop) return null
  if (shopHasCoordinates(shop)) return shop

  const hasAddress =
    shop.provinceCode && shop.districtCode && shop.wardCode && shop.addressDetail.trim()
  if (!hasAddress) return shop

  const geo = await geocodeShopLocation(shop)
  if (!geo) return shop

  await persistShopCoordinates(geo.point.lat, geo.point.lng)
  return { ...shop, latitude: geo.point.lat, longitude: geo.point.lng }
}

export type SaveShopSettingsResult = {
  settings: ShopSettings
  geocoded: boolean
  formattedAddress?: string
  precision?: string
}

export async function saveShopSettings(
  input: VietnamAddressParts,
  manualCoords?: { latitude: number; longitude: number } | null
): Promise<SaveShopSettingsResult> {
  const admin = getSupabaseServerClient()

  const payload = {
    address_detail: input.addressDetail.trim(),
    province_code: input.provinceCode,
    province_name: input.provinceName,
    district_code: input.districtCode,
    district_name: input.districtName,
    ward_code: input.wardCode,
    ward_name: input.wardName,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await admin
    .from('shop_settings')
    .upsert({ id: 1, ...payload })
    .select()
    .single()

  if (error || !data) throw error ?? new Error('Failed to save shop settings')

  const saved = mapRow(data as Row)

  if (
    manualCoords &&
    Number.isFinite(manualCoords.latitude) &&
    Number.isFinite(manualCoords.longitude)
  ) {
    await persistShopCoordinates(manualCoords.latitude, manualCoords.longitude)
    return {
      settings: {
        ...saved,
        latitude: manualCoords.latitude,
        longitude: manualCoords.longitude,
      },
      geocoded: true,
      precision: 'manual',
    }
  }

  const geo = await geocodeShopLocation(saved)

  if (geo) {
    await persistShopCoordinates(geo.point.lat, geo.point.lng)
    return {
      settings: { ...saved, latitude: geo.point.lat, longitude: geo.point.lng },
      geocoded: true,
      formattedAddress: geo.formattedAddress,
      precision: geo.precision,
    }
  }

  await admin
    .from('shop_settings')
    .update({ latitude: null, longitude: null })
    .eq('id', 1)

  return { settings: { ...saved, latitude: null, longitude: null }, geocoded: false }
}

export function shopHasCoordinates(settings: ShopSettings): boolean {
  return (
    settings.latitude != null &&
    settings.longitude != null &&
    !Number.isNaN(settings.latitude) &&
    !Number.isNaN(settings.longitude!)
  )
}

export function shopHasAddress(settings: ShopSettings): boolean {
  return Boolean(
    settings.addressDetail?.trim() &&
      settings.provinceCode &&
      settings.districtCode &&
      settings.wardCode
  )
}

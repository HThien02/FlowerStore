import type { VietnamAddressParts } from '@/lib/vietnam-address/types'
import { geocodeVietnamParts } from '@/lib/shipping/geocode-vietnam'
import { roadDistanceKm } from '@/lib/shipping/distance'
import { deliveryFeeForKm, type ShippingQuoteResult } from '@/lib/shipping/tiers'
import { getShopSettingsWithCoordinates, shopHasAddress, shopHasCoordinates } from '@/lib/shop/settings'

export async function calculateShippingQuote(
  customer: VietnamAddressParts
): Promise<ShippingQuoteResult> {
  const shop = await getShopSettingsWithCoordinates()
  if (!shop) {
    return {
      supported: false,
      distanceKm: 0,
      deliveryFee: 0,
      reason: 'shop_not_configured',
      message: 'Shop settings table missing — run scripts/setup-shop-settings.sql on Supabase',
    }
  }
  if (!shopHasAddress(shop)) {
    return {
      supported: false,
      distanceKm: 0,
      deliveryFee: 0,
      reason: 'shop_not_configured',
      message: 'Shop address is not configured yet',
    }
  }
  if (!shopHasCoordinates(shop)) {
    return {
      supported: false,
      distanceKm: 0,
      deliveryFee: 0,
      reason: 'shop_not_configured',
      message:
        'Could not locate shop coordinates. Re-save address in Admin → Shop or set GOONG_API_KEY in .env.local',
    }
  }

  const customerGeoResult = await geocodeVietnamParts(customer, {
    requireStreetLevel: Boolean(customer.addressDetail.trim()),
  })
  if (!customerGeoResult) {
    return {
      supported: false,
      distanceKm: 0,
      deliveryFee: 0,
      reason: 'geocode_failed',
      message: 'Could not locate delivery address',
    }
  }

  const distanceKm = await roadDistanceKm(
    { lat: shop.latitude!, lng: shop.longitude! },
    customerGeoResult.point
  )

  const roundedKm = Math.round(distanceKm * 100) / 100
  return deliveryFeeForKm(roundedKm)
}

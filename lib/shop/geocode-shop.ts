import { geocodeVietnamParts } from '@/lib/shipping/geocode-vietnam'
import type { VietnamAddressParts } from '@/lib/vietnam-address/types'
import type { ShopSettings } from '@/lib/shop/settings'

export function shopToAddressParts(shop: ShopSettings): VietnamAddressParts | null {
  if (!shop.provinceCode || !shop.districtCode || !shop.wardCode) return null
  return {
    addressDetail: shop.addressDetail,
    provinceCode: shop.provinceCode,
    provinceName: shop.provinceName ?? '',
    districtCode: shop.districtCode,
    districtName: shop.districtName ?? '',
    wardCode: shop.wardCode,
    wardName: shop.wardName ?? '',
  }
}

/** Geocode shop — requires street-level match when street address is set. */
export async function geocodeShopLocation(shop: ShopSettings) {
  const parts = shopToAddressParts(shop)
  if (!parts) return null
  return geocodeVietnamParts(parts, { requireStreetLevel: Boolean(parts.addressDetail.trim()) })
}

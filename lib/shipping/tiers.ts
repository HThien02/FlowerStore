/** Distance-based delivery fees (VND). Distance is road km when Goong/OSRM available. */
export const SHIPPING_TIERS = [
  { maxKm: 1, fee: 0 },
  { maxKm: 3, fee: 15_000 },
  { maxKm: 5, fee: 25_000 },
  { maxKm: 10, fee: 40_000 },
  { maxKm: 15, fee: 55_000 },
  { maxKm: 20, fee: 70_000 },
] as const

export const MAX_DELIVERY_KM = 20

export type ShippingQuoteResult =
  | {
      supported: true
      distanceKm: number
      deliveryFee: number
      tierLabel: string
    }
  | {
      supported: false
      distanceKm: number
      deliveryFee: 0
      reason: 'out_of_range' | 'shop_not_configured' | 'geocode_failed'
      message: string
    }

export function isShippingOutOfRange(
  quote: ShippingQuoteResult | null | undefined
): quote is Extract<ShippingQuoteResult, { reason: 'out_of_range' }> {
  return Boolean(quote && !quote.supported && quote.reason === 'out_of_range')
}

export function deliveryFeeForKm(distanceKm: number): Omit<ShippingQuoteResult, 'distanceKm'> & { distanceKm: number } {
  if (distanceKm > MAX_DELIVERY_KM) {
    return {
      supported: false,
      distanceKm,
      deliveryFee: 0,
      reason: 'out_of_range',
      message: `Over ${MAX_DELIVERY_KM} km — delivery not available`,
    }
  }

  for (const tier of SHIPPING_TIERS) {
    if (distanceKm <= tier.maxKm) {
      const label =
        tier.fee === 0
          ? `≤ ${tier.maxKm} km — free`
          : tier.maxKm === SHIPPING_TIERS[0].maxKm
            ? `≤ ${tier.maxKm} km`
            : `≤ ${tier.maxKm} km`
      return {
        supported: true,
        distanceKm,
        deliveryFee: tier.fee,
        tierLabel: label,
      }
    }
  }

  return {
    supported: false,
    distanceKm,
    deliveryFee: 0,
    reason: 'out_of_range',
    message: `Over ${MAX_DELIVERY_KM} km — delivery not available`,
  }
}

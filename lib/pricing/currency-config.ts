/**
 * Cấu hình tiền tệ cửa hàng.
 *
 * - Giá trong DB (products, orders, deliveries) luôn là **VND** (số nguyên).
 * - Locale `vi`: hiển thị VND.
 * - Locale `en`: quy đổi sang USD bằng PAYOS_USD_TO_VND_RATE (cùng tỷ giá PayOS).
 *
 * .env.local:
 *   PAYOS_USD_TO_VND_RATE=25000
 *   NEXT_PUBLIC_PAYOS_USD_TO_VND_RATE=25000  (cho client components)
 */

export const STORE_CURRENCY = 'VND' as const

/** Giá mặc định khi seed / migration sản phẩm. */
export const DEFAULT_PRODUCT_PRICE_VND = 10_000

export function readUsdToVndRate(): number {
  const raw =
    process.env.PAYOS_USD_TO_VND_RATE ??
    process.env.NEXT_PUBLIC_PAYOS_USD_TO_VND_RATE ??
    '25000'
  const rate = Number(raw)
  return Number.isFinite(rate) && rate > 0 ? rate : 25_000
}

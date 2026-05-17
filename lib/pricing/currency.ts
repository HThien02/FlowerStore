import { readUsdToVndRate, STORE_CURRENCY } from './currency-config'

export { readUsdToVndRate, STORE_CURRENCY, DEFAULT_PRODUCT_PRICE_VND } from './currency-config'

export type MoneyLocale = 'vi' | 'en' | string

export function roundVnd(amount: number): number {
  return Math.round(amount)
}

/** VND → USD (2 chữ số thập phân, dùng khi locale en). */
export function vndToUsd(amountVnd: number): number {
  return Math.round((amountVnd / readUsdToVndRate()) * 100) / 100
}

/** USD → VND (làm tròn số nguyên). */
export function usdToVnd(amountUsd: number): number {
  return roundVnd(amountUsd * readUsdToVndRate())
}

export function formatMoney(amountVnd: number, locale: MoneyLocale): string {
  const vnd = roundVnd(amountVnd)
  if (locale === 'vi' || String(locale).startsWith('vi')) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(vnd)
  }
  const usd = vndToUsd(vnd)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(usd)
}

/** PayOS: total đơn đã là VND. */
export function toPayosAmount(totalVnd: number): number {
  return Math.max(roundVnd(totalVnd), 1000)
}

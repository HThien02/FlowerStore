import { PayOS } from '@payos/node'

let client: PayOS | null = null

export function isPayOSConfigured(): boolean {
  return Boolean(
    process.env.PAYOS_CLIENT_ID &&
      process.env.PAYOS_API_KEY &&
      process.env.PAYOS_CHECKSUM_KEY
  )
}

export function getPayOS(): PayOS {
  if (!isPayOSConfigured()) {
    throw new Error('PayOS is not configured (PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY)')
  }
  if (!client) {
    client = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID!,
      apiKey: process.env.PAYOS_API_KEY!,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
    })
  }
  return client
}

export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

/**
 * Mã đơn PayOS: 6 chữ số (100000–999999).
 * Cùng prefix VQRIO → mô tả ≤11 ký tự (VQRIO123456), tránh NH cắt nội dung CK.
 */
export function generatePayosOrderCode(): number {
  return Math.floor(100_000 + Math.random() * 900_000)
}

/**
 * Nội dung CK trên QR — PayOS webhook mẫu: orderCode 123 → "VQRIO123".
 */
export function payosDescription(orderCode: number): string {
  const code = String(orderCode).replace(/\D/g, '').slice(-6)
  return `VQRIO${code}`
}

import { roundVnd } from '@/lib/pricing/currency'

export { formatMoney } from '@/lib/pricing/currency'

/** Số tiền gửi PayOS (field `amount`, VND, tối thiểu 1000). */
export function roundPayosAmount(totalVnd: number): number {
  return Math.max(roundVnd(totalVnd), 1000)
}

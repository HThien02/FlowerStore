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
 * Mã đơn PayOS: số nguyên ≤9 chữ số (theo mẫu chính thức).
 * Tránh timestamp 13+ chữ số — QR/đối soát ngân hàng dễ lỗi.
 */
export function generatePayosOrderCode(): number {
  const tail = Date.now() % 10_000_000 // 7 chữ số
  const rand = Math.floor(Math.random() * 100) // 2 chữ số
  const code = tail * 100 + rand
  return code > 0 ? code : Math.floor(Math.random() * 900_000_000) + 100_000_000
}

/**
 * Nội dung CK trên QR — PayOS dùng dạng VQRIO{orderCode} khi đối soát (xem webhook mẫu).
 * VD orderCode 123 → description "VQRIO123".
 */
export function payosDescription(orderCode: number): string {
  const code = String(orderCode).replace(/\D/g, '')
  return `VQRIO${code}`
}

export { toPayosAmount, formatMoney } from '@/lib/pricing/currency'

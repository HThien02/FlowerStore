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

/** PayOS yêu cầu orderCode là số nguyên duy nhất. */
export function generatePayosOrderCode(): number {
  return Date.now() * 10 + Math.floor(Math.random() * 10)
}

/** Mô tả chuyển khoản (giới hạn ~25 ký tự). */
export function payosDescription(orderId: string): string {
  const short = orderId.replace(/-/g, '').slice(-10)
  return `TF-${short}`.slice(0, 25)
}

/** Quy đổi USD (giá trong DB) → VND cho PayOS. */
export function usdTotalToVnd(totalUsd: number): number {
  const rate = Number(process.env.PAYOS_USD_TO_VND_RATE || 25000)
  const vnd = Math.round(totalUsd * rate)
  return Math.max(vnd, 1000)
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

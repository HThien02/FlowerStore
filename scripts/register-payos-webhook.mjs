/**
 * Đăng ký webhook PayOS (chạy 1 lần sau deploy).
 * Usage: node --env-file=.env.local scripts/register-payos-webhook.mjs
 */
import { PayOS } from '@payos/node'

const base = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
const webhookUrl = `${base}/api/webhooks/payos`

if (!base || base.includes('localhost')) {
  console.error(
    'Set NEXT_PUBLIC_APP_URL to your public HTTPS URL (ngrok or Vercel). PayOS cannot reach localhost.'
  )
  process.exit(1)
}

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
})

try {
  const result = await payos.webhooks.confirm(webhookUrl)
  console.log('Webhook registered:', result)
} catch (e) {
  console.error('Failed:', e.message)
  process.exit(1)
}

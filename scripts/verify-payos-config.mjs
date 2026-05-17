/**
 * Kiểm tra cấu hình PayOS trước deploy.
 * Usage: node --env-file=.env.local scripts/verify-payos-config.mjs
 */
import { PayOS } from '@payos/node'

const base = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
const issues = []

if (!process.env.PAYOS_CLIENT_ID) issues.push('Thiếu PAYOS_CLIENT_ID')
if (!process.env.PAYOS_API_KEY) issues.push('Thiếu PAYOS_API_KEY')
if (!process.env.PAYOS_CHECKSUM_KEY) issues.push('Thiếu PAYOS_CHECKSUM_KEY')
if (!base || base.includes('localhost')) {
  issues.push('NEXT_PUBLIC_APP_URL phải là domain HTTPS production (không localhost)')
}

const sampleCode = Number(String(Date.now()).slice(-6))
const desc = `VQRIO${sampleCode}`

if (issues.length) {
  console.error('❌ Cấu hình chưa OK:\n', issues.map((i) => `  - ${i}`).join('\n'))
  process.exit(1)
}

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
})

console.log('✓ Biến môi trường OK')
console.log('  APP_URL:', base)
console.log('  Webhook:', `${base}/api/webhooks/payos`)
console.log('  Return: ', `${base}/api/payos/return?orderId=...&locale=vi`)
console.log('  Mẫu orderCode/description:', sampleCode, '/', desc)

try {
  const webhook = await payos.webhooks.get()
  console.log('✓ PayOS API kết nối được')
  console.log('  Webhook đã đăng ký:', webhook?.webhookUrl ?? webhook)
} catch (e) {
  console.warn('⚠ Không đọc được webhook (có thể chưa đăng ký):', e.message)
}

console.log('\nSau deploy: đặt đơn MỚI, quét QR PayOS, cột "tiền thanh toán" phải > 0.')

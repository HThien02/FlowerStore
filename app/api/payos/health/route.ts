import { NextResponse } from 'next/server'
import {
  generatePayosOrderCode,
  getAppBaseUrl,
  isPayOSConfigured,
  isPublicHttpsAppUrl,
  payosDescription,
} from '@/lib/payos'

/** Kiểm tra production đã chạy bản PayOS mới (description = VQRIO + orderCode). */
export async function GET() {
  const sample = generatePayosOrderCode()
  const description = payosDescription(sample)
  const vqrioFormat = description === `VQRIO${sample}`

  return NextResponse.json({
    ok: true,
    payosIntegration: 'v4-vqrio-6digit',
    payosConfigured: isPayOSConfigured(),
    sampleOrderCode: sample,
    sampleDescription: description,
    descriptionUsesVqrioPrefix: vqrioFormat,
    descriptionLength: description.length,
    appBaseUrl: getAppBaseUrl(),
    publicHttps: isPublicHttpsAppUrl(),
    hint: vqrioFormat
      ? isPublicHttpsAppUrl()
        ? 'OK — đặt đơn pickup + PayOS, quét QR trên trang PayOS (không chuyển tay).'
        : 'Set NEXT_PUBLIC_APP_URL=https://your-domain.com (PayOS không redirect về localhost).'
      : 'BUG — description không đúng định dạng VQRIO',
  })
}

import { NextResponse } from 'next/server'
import { generatePayosOrderCode, isPayOSConfigured, payosDescription } from '@/lib/payos'

/** Kiểm tra production đã chạy bản PayOS mới (description = VQRIO + orderCode). */
export async function GET() {
  const sample = generatePayosOrderCode()
  const description = payosDescription(sample)
  const vqrioFormat = description === `VQRIO${sample}`

  return NextResponse.json({
    ok: true,
    payosIntegration: 'v3-vqrio-description',
    payosConfigured: isPayOSConfigured(),
    sampleOrderCode: sample,
    sampleDescription: description,
    descriptionUsesVqrioPrefix: vqrioFormat,
    hint: vqrioFormat
      ? 'OK — mô tả đơn dạng VQRIO{orderCode} (vd VQRIO123), khớp webhook PayOS'
      : 'BUG — description không đúng định dạng VQRIO',
  })
}

import { NextResponse } from 'next/server'
import { generatePayosOrderCode, isPayOSConfigured, payosDescription } from '@/lib/payos'

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
    hint: vqrioFormat
      ? 'OK — orderCode 6 số, mô tả VQRIO{code} (≤11 ký tự). Deploy + đơn mới + quét QR.'
      : 'BUG — description không đúng định dạng VQRIO',
  })
}

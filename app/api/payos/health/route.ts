import { NextResponse } from 'next/server'
import { generatePayosOrderCode, isPayOSConfigured, payosDescription } from '@/lib/payos'

/** Kiểm tra production đã chạy bản PayOS mới (description = số orderCode). */
export async function GET() {
  const sample = generatePayosOrderCode()
  const description = payosDescription(sample)
  const numericDescription = description === String(sample)

  return NextResponse.json({
    ok: true,
    payosIntegration: 'v2-numeric-description',
    payosConfigured: isPayOSConfigured(),
    sampleOrderCode: sample,
    sampleDescription: description,
    descriptionMatchesOrderCode: numericDescription,
    hint: numericDescription
      ? 'Production OK — đơn mới sẽ có mô tả = mã số (vd 177902827), không còn TF...'
      : 'BUG — description không khớp orderCode',
  })
}
